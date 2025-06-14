from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import io
from typing import List, Dict, Any
import joblib
import logging
from datetime import datetime
import uvicorn

# Mock ML models for demonstration
class MockBinaryClassifier:
    """Mock binary classifier that simulates threat detection"""
    
    def predict_proba(self, X):
        """Return probability scores for binary classification"""
        # Simulate realistic probability distribution
        n_samples = len(X)
        # Most samples will be benign (low probability), some will be threats
        probs = np.random.beta(2, 8, n_samples)  # Skewed towards low values
        # Add some high-probability threats
        threat_indices = np.random.choice(n_samples, size=int(n_samples * 0.1), replace=False)
        probs[threat_indices] = np.random.beta(8, 2, len(threat_indices))  # High probability threats
        
        # Return probabilities for [benign, threat] classes
        return np.column_stack([1 - probs, probs])

class MockPriorityClassifier:
    """Mock priority classifier that assigns priority levels"""
    
    def predict_proba(self, X):
        """Return probability scores for priority classification"""
        n_samples = len(X)
        
        # Create probability distribution for [low, medium, high] priority
        priorities = []
        for _ in range(n_samples):
            # Simulate realistic priority distribution
            rand = np.random.random()
            if rand < 0.6:  # 60% low priority
                probs = [0.7 + np.random.random() * 0.25, 
                        0.15 + np.random.random() * 0.1, 
                        0.05 + np.random.random() * 0.1]
            elif rand < 0.85:  # 25% medium priority
                probs = [0.2 + np.random.random() * 0.2, 
                        0.5 + np.random.random() * 0.3, 
                        0.15 + np.random.random() * 0.15]
            else:  # 15% high priority
                probs = [0.1 + np.random.random() * 0.1, 
                        0.2 + np.random.random() * 0.2, 
                        0.6 + np.random.random() * 0.3]
            
            # Normalize probabilities
            total = sum(probs)
            probs = [p / total for p in probs]
            priorities.append(probs)
        
        return np.array(priorities)

# Initialize FastAPI app
app = FastAPI(
    title="Cyber EDR Analysis API",
    description="AI-powered security analysis for VMware Carbon Black EDR data",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize mock models
binary_model = MockBinaryClassifier()
priority_model = MockPriorityClassifier()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Expected EDR fields for Carbon Black data
EXPECTED_EDR_FIELDS = [
    'alert_severity', 'childproc_count', 'group', 'hostname', 'process_name',
    'cmdline', 'parent_name', 'username', 'path', 'netconn_count',
    'filemod_count', 'regmod_count', 'crossproc_count', 'last_update',
    'start', 'sensor_id', 'cb_server', 'process_pid', 'parent_pid',
    'process_md5', 'parent_md5'
]

# Group priority multipliers
GROUP_MULTIPLIERS = {
    'executive': 2.5,
    'management': 2.0,
    'developer': 1.5,
    'analyst': 1.3,
    'user': 1.0,
    'contractor': 0.8
}

def extract_features(df: pd.DataFrame) -> np.ndarray:
    """Extract numerical features from EDR data for ML models"""
    features = []
    
    for _, row in df.iterrows():
        feature_vector = []
        
        # Numerical features
        feature_vector.extend([
            row.get('childproc_count', 0),
            row.get('netconn_count', 0),
            row.get('filemod_count', 0),
            row.get('regmod_count', 0),
            row.get('crossproc_count', 0),
            row.get('process_pid', 0),
            row.get('parent_pid', 0),
            row.get('sensor_id', 0)
        ])
        
        # Categorical features (encoded)
        severity_map = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
        feature_vector.append(severity_map.get(str(row.get('alert_severity', '')).lower(), 0))
        
        # Process name features (simple encoding)
        process_name = str(row.get('process_name', '')).lower()
        suspicious_processes = ['cmd.exe', 'powershell.exe', 'rundll32.exe', 'regsvr32.exe']
        feature_vector.append(1 if any(proc in process_name for proc in suspicious_processes) else 0)
        
        # Command line features
        cmdline = str(row.get('cmdline', '')).lower()
        suspicious_keywords = ['download', 'invoke', 'bypass', 'hidden', 'encoded']
        feature_vector.append(sum(1 for keyword in suspicious_keywords if keyword in cmdline))
        
        # Path features
        path = str(row.get('path', '')).lower()
        system_paths = ['system32', 'syswow64']
        feature_vector.append(1 if any(sys_path in path for sys_path in system_paths) else 0)
        
        features.append(feature_vector)
    
    return np.array(features)

def normalize_group_name(group: str) -> str:
    """Normalize group names to match expected categories"""
    group_lower = str(group).lower()
    
    if any(keyword in group_lower for keyword in ['exec', 'ceo', 'president', 'director']):
        return 'executive'
    elif any(keyword in group_lower for keyword in ['manager', 'lead', 'supervisor']):
        return 'management'
    elif any(keyword in group_lower for keyword in ['dev', 'engineer', 'programmer']):
        return 'developer'
    elif any(keyword in group_lower for keyword in ['analyst', 'security', 'admin']):
        return 'analyst'
    elif any(keyword in group_lower for keyword in ['contract', 'temp', 'vendor']):
        return 'contractor'
    else:
        return 'user'

@app.post("/analyze")
async def analyze_edr_data(file: UploadFile = File(...)):
    """Analyze uploaded EDR data file"""
    try:
        logger.info(f"Received file: {file.filename}")
        
        # Read uploaded file
        contents = await file.read()
        
        # Parse Excel/CSV file
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
            else:
                df = pd.read_excel(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")
        
        logger.info(f"Parsed dataframe with shape: {df.shape}")
        
        # Extract features for ML models
        features = extract_features(df)
        
        # Step 1: Binary classification (threat detection)
        binary_probs = binary_model.predict_proba(features)
        threat_probs = binary_probs[:, 1]  # Probability of being a threat
        
        # Filter records predicted as threats (threshold = 0.5)
        threat_mask = threat_probs >= 0.5
        threat_indices = np.where(threat_mask)[0]
        
        logger.info(f"Detected {len(threat_indices)} potential threats out of {len(df)} records")
        
        if len(threat_indices) == 0:
            return JSONResponse({
                "totalProcessed": len(df),
                "threatsDetected": 0,
                "filteredResults": [],
                "processingTime": "1.2s",
                "modelVersion": "1.0.0"
            })
        
        # Step 2: Priority classification for detected threats
        threat_features = features[threat_indices]
        priority_probs = priority_model.predict_proba(threat_features)
        
        # Build results
        results = []
        for i, idx in enumerate(threat_indices):
            row = df.iloc[idx]
            
            # Get priority probabilities [low, medium, high]
            low_prob, med_prob, high_prob = priority_probs[i]
            base_priority_score = high_prob  # Use high priority probability as base score
            
            # Apply group modulation
            group = normalize_group_name(row.get('group', 'user'))
            group_multiplier = GROUP_MULTIPLIERS.get(group, 1.0)
            final_priority_score = min(1.0, base_priority_score * group_multiplier)
            
            # Determine final priority category
            if final_priority_score >= 0.8:
                final_priority = 'high'
            elif final_priority_score >= 0.5:
                final_priority = 'medium'
            else:
                final_priority = 'low'
            
            # Create result record
            result = {
                'id': int(idx),
                'group': group,
                'hostname': str(row.get('hostname', 'Unknown')),
                'username': str(row.get('username', 'Unknown')),
                'process_name': str(row.get('process_name', 'Unknown')),
                'path': str(row.get('path', 'Unknown')),
                'alert_severity': str(row.get('alert_severity', 'medium')),
                'confidence': float(threat_probs[idx]),
                'basePriority': float(base_priority_score),
                'groupMultiplier': float(group_multiplier),
                'priorityScore': float(final_priority_score),
                'finalPriority': final_priority,
                'childproc_count': int(row.get('childproc_count', 0)),
                'netconn_count': int(row.get('netconn_count', 0)),
                'filemod_count': int(row.get('filemod_count', 0)),
                'timestamp': datetime.now().isoformat(),
                'cmdline': str(row.get('cmdline', '')),
                'parent_name': str(row.get('parent_name', 'Unknown')),
                'sensor_id': int(row.get('sensor_id', 0)),
                'process_pid': int(row.get('process_pid', 0)),
                'parent_pid': int(row.get('parent_pid', 0))
            }
            results.append(result)
        
        # Sort results by priority score (descending)
        results.sort(key=lambda x: x['priorityScore'], reverse=True)
        
        logger.info(f"Analysis complete. Returning {len(results)} threat records")
        
        return JSONResponse({
            "totalProcessed": len(df),
            "threatsDetected": len(results),
            "filteredResults": results,
            "processingTime": "2.1s",
            "modelVersion": "1.0.0"
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/config")
async def get_config():
    """Get current configuration"""
    return {
        "groupMultipliers": GROUP_MULTIPLIERS,
        "expectedFields": EXPECTED_EDR_FIELDS,
        "modelInfo": {
            "binaryModel": "MockBinaryClassifier v1.0",
            "priorityModel": "MockPriorityClassifier v1.0"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)