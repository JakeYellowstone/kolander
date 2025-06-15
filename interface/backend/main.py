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
import os
import json
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Kolander OCI Analysis API",
    description="AI-powered security analysis for VMware Carbon Black EDR data",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
binary_model = None
priority_model = None
binary_scaler = None
priority_scaler = None
binary_features = None
priority_features = None

# Configuration files paths
CONFIG_FILE = Path("config.json")
STATS_FILE = Path("stats.json")

# Default configurations
DEFAULT_GROUP_MULTIPLIERS = {
    'executive': 2.5,
    'management': 2.0,
    'developer': 1.5,
    'analyst': 1.3,
    'user': 1.0,
    'contractor': 0.8
}

DEFAULT_ANALYSIS_SETTINGS = {
    'binaryThreshold': 0.5,
    'highPriorityThreshold': 0.8,
    'mediumPriorityThreshold': 0.5,
    'enableGroupModulation': True
}

DEFAULT_STATS = {
    'totalAnalyses': 0,
    'totalAlertsProcessed': 0,
    'totalThreatsDetected': 0,
    'priorityBreakdown': {
        'high': 0,
        'medium': 0,
        'low': 0
    },
    'lastAnalysisDate': None,
    'createdAt': datetime.now().isoformat()
}

# Current configuration (will be loaded from file)
current_config = {
    'groupMultipliers': DEFAULT_GROUP_MULTIPLIERS.copy(),
    'analysisSettings': DEFAULT_ANALYSIS_SETTINGS.copy()
}

# Current statistics
current_stats = DEFAULT_STATS.copy()

def load_config():
    """Load configuration from JSON file"""
    global current_config
    
    try:
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                loaded_config = json.load(f)
                
            # Validate and merge with defaults
            if 'groupMultipliers' in loaded_config:
                current_config['groupMultipliers'] = {
                    **DEFAULT_GROUP_MULTIPLIERS,
                    **loaded_config['groupMultipliers']
                }
            
            if 'analysisSettings' in loaded_config:
                current_config['analysisSettings'] = {
                    **DEFAULT_ANALYSIS_SETTINGS,
                    **loaded_config['analysisSettings']
                }
                
            logger.info("Configuration loaded from config.json")
        else:
            logger.info("No config.json found, using default configuration")
            save_config()  # Create default config file
            
    except Exception as e:
        logger.error(f"Error loading configuration: {str(e)}")
        logger.info("Using default configuration")
        current_config = {
            'groupMultipliers': DEFAULT_GROUP_MULTIPLIERS.copy(),
            'analysisSettings': DEFAULT_ANALYSIS_SETTINGS.copy()
        }

def save_config():
    """Save current configuration to JSON file"""
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(current_config, f, indent=2, ensure_ascii=False)
        logger.info("Configuration saved to config.json")
    except Exception as e:
        logger.error(f"Error saving configuration: {str(e)}")

def load_stats():
    """Load statistics from JSON file"""
    global current_stats
    
    try:
        if STATS_FILE.exists():
            with open(STATS_FILE, 'r', encoding='utf-8') as f:
                loaded_stats = json.load(f)
                
            # Validate and merge with defaults
            current_stats = {**DEFAULT_STATS, **loaded_stats}
            logger.info("Statistics loaded from stats.json")
        else:
            logger.info("No stats.json found, using default statistics")
            save_stats()  # Create default stats file
            
    except Exception as e:
        logger.error(f"Error loading statistics: {str(e)}")
        logger.info("Using default statistics")
        current_stats = DEFAULT_STATS.copy()

def save_stats():
    """Save current statistics to JSON file"""
    try:
        with open(STATS_FILE, 'w', encoding='utf-8') as f:
            json.dump(current_stats, f, indent=2, ensure_ascii=False)
        logger.info("Statistics saved to stats.json")
    except Exception as e:
        logger.error(f"Error saving statistics: {str(e)}")

def update_analysis_stats(total_processed: int, threats_detected: int, priority_breakdown: Dict[str, int]):
    """Update analysis statistics"""
    global current_stats
    
    current_stats['totalAnalyses'] += 1
    current_stats['totalAlertsProcessed'] += total_processed
    current_stats['totalThreatsDetected'] += threats_detected
    current_stats['lastAnalysisDate'] = datetime.now().isoformat()
    
    # Update priority breakdown
    for priority, count in priority_breakdown.items():
        if priority in current_stats['priorityBreakdown']:
            current_stats['priorityBreakdown'][priority] += count
    
    # Save updated stats
    save_stats()
    logger.info(f"Statistics updated: {threats_detected} threats detected from {total_processed} records")

def load_models():
    """Load ML models and scalers"""
    global binary_model, priority_model, binary_scaler, priority_scaler
    global binary_features, priority_features
    
    models_dir = Path("models")
    
    try:
        # Load binary classification model
        binary_model = joblib.load(models_dir / "binary_model.pkl")
        binary_scaler = joblib.load(models_dir / "scaler.pkl")
        binary_features = joblib.load(models_dir / "feature_names.pkl")
        
        # Load priority classification model
        priority_model = joblib.load(models_dir / "priority_model.pkl")
        priority_scaler = joblib.load(models_dir / "priority_scaler.pkl")
        priority_features = joblib.load(models_dir / "priority_feature_names.pkl")
        
        logger.info("Models loaded successfully")
        logger.info(f"Binary model features: {len(binary_features)}")
        logger.info(f"Priority model features: {len(priority_features)}")
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        logger.info("Models not found. Please run create_models.py first.")

def preprocess_data_for_binary(df: pd.DataFrame) -> np.ndarray:
    """Preprocess data for binary classification"""
    try:
        # Drop columns that were dropped during training
        drop_cols = [
            "Unnamed: 0", "created_time", "comms_ip", "description", "feed_name", "sha256", "incident",
            "process_guid", "status", "unique_id", "watchlist_id", "watchlist_name", "labelisation"
        ]
        
        df_processed = df.drop(columns=drop_cols, errors='ignore')
        
        # Convert categorical variables
        df_processed = pd.get_dummies(df_processed)
        
        # Align features with training data
        for feature in binary_features:
            if feature not in df_processed.columns:
                df_processed[feature] = 0
        
        # Select only the features used during training
        df_processed = df_processed[binary_features]
        
        # Scale the data
        X_scaled = binary_scaler.transform(df_processed)
        
        return X_scaled
        
    except Exception as e:
        logger.error(f"Error in binary preprocessing: {str(e)}")
        raise

def preprocess_data_for_priority(df: pd.DataFrame) -> np.ndarray:
    """Preprocess data for priority classification"""
    try:
        # Drop columns that were dropped during training
        drop_cols = [
            "Unnamed: 0", "created_time", "comms_ip", "description", "feed_name", "sha256", "labelisation",
            "process_guid", "status", "unique_id", "watchlist_id", "watchlist_name", "incident"
        ]
        
        df_processed = df.drop(columns=drop_cols, errors='ignore')
        
        # Convert categorical variables
        df_processed = pd.get_dummies(df_processed)
        
        # Align features with training data
        for feature in priority_features:
            if feature not in df_processed.columns:
                df_processed[feature] = 0
        
        # Select only the features used during training
        df_processed = df_processed[priority_features]
        
        # Scale the data
        X_scaled = priority_scaler.transform(df_processed)
        
        return X_scaled
        
    except Exception as e:
        logger.error(f"Error in priority preprocessing: {str(e)}")
        raise

def normalize_group_name(group: str) -> str:
    """Normalize group names to match expected categories"""
    if pd.isna(group) or group == '':
        return 'user'
    
    group_lower = str(group).lower()
    
    if any(keyword in group_lower for keyword in ['exec', 'ceo', 'president', 'director', 'directeur']):
        return 'executive'
    elif any(keyword in group_lower for keyword in ['manager', 'lead', 'supervisor', 'chef', 'responsable']):
        return 'management'
    elif any(keyword in group_lower for keyword in ['dev', 'engineer', 'programmer', 'développeur', 'ingénieur']):
        return 'developer'
    elif any(keyword in group_lower for keyword in ['analyst', 'security', 'admin', 'analyste', 'sécurité']):
        return 'analyst'
    elif any(keyword in group_lower for keyword in ['contract', 'temp', 'vendor', 'prestataire', 'stagiaire']):
        return 'contractor'
    else:
        return 'user'

def safe_int(val, default=0):
    try:
        if pd.isna(val):
            return default
        return int(float(val))  # Convertit même les "42.0" ou strings numériques
    except (ValueError, TypeError):
        return default

@app.post("/analyze")
async def analyze_edr_data(file: UploadFile = File(...)):
    """Analyze uploaded EDR data file using real ML models"""
    try:
        if not binary_model or not priority_model:
            raise HTTPException(status_code=500, detail="ML models not loaded. Please ensure models are trained and available.")
        
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
        logger.info(f"Columns: {df.columns.tolist()}")
        
        # Step 1: Binary classification (threat detection)
        try:
            X_binary = preprocess_data_for_binary(df)
            binary_probs = binary_model.predict_proba(X_binary)
            threat_probs = binary_probs[:, 1]  # Probability of being a threat
        except Exception as e:
            logger.error(f"Binary classification error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Binary classification failed: {str(e)}")
        
        # Filter records predicted as threats
        binary_threshold = current_config['analysisSettings']['binaryThreshold']
        threat_mask = threat_probs >= binary_threshold
        threat_indices = np.where(threat_mask)[0]
        
        logger.info(f"Detected {len(threat_indices)} potential threats out of {len(df)} records (threshold: {binary_threshold})")
        
        if len(threat_indices) == 0:
            # Update stats even if no threats detected
            priority_breakdown = {'high': 0, 'medium': 0, 'low': 0}
            update_analysis_stats(len(df), 0, priority_breakdown)
            
            return JSONResponse({
                "totalProcessed": len(df),
                "threatsDetected": 0,
                "filteredResults": [],
                "processingTime": "1.2s",
                "modelVersion": "2.0.0"
            })
        
        # Step 2: Priority classification for detected threats
        try:
            threat_df = df.iloc[threat_indices].copy()
            X_priority = preprocess_data_for_priority(threat_df)
            priority_probs = priority_model.predict_proba(X_priority)
        except Exception as e:
            logger.error(f"Priority classification error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Priority classification failed: {str(e)}")
        
        # Build results and count priorities
        results = []
        priority_breakdown = {'high': 0, 'medium': 0, 'low': 0}
        
        for i, idx in enumerate(threat_indices):
            row = df.iloc[idx]
            
            # Get priority probabilities (assuming 3 classes: low, medium, high)
            if priority_probs.shape[1] == 3:
                low_prob, med_prob, high_prob = priority_probs[i]
            else:
                # If binary priority, convert to 3-class
                if priority_probs.shape[1] == 2:
                    low_prob = priority_probs[i][0]
                    high_prob = priority_probs[i][1]
                    med_prob = 0.5
                else:
                    # Single class, use as high priority
                    high_prob = priority_probs[i][0] if len(priority_probs[i]) > 0 else 0.5
                    med_prob = 0.3
                    low_prob = 0.2
            
            base_priority_score = high_prob
            
            # Apply group modulation if enabled
            final_priority_score = base_priority_score
            group_multiplier = 1.0
            
            if current_config['analysisSettings']['enableGroupModulation']:
                group = normalize_group_name(row.get('group', 'user'))
                group_multiplier = current_config['groupMultipliers'].get(group, 1.0)
                final_priority_score = min(1.0, base_priority_score * group_multiplier)
            else:
                group = normalize_group_name(row.get('group', 'user'))
            
            # Determine final priority category
            high_threshold = current_config['analysisSettings']['highPriorityThreshold']
            medium_threshold = current_config['analysisSettings']['mediumPriorityThreshold']
            
            if final_priority_score >= high_threshold:
                final_priority = 'high'
            elif final_priority_score >= medium_threshold:
                final_priority = 'medium'
            else:
                final_priority = 'low'
            
            # Count priorities for stats
            priority_breakdown[final_priority] += 1
            
            # Create result record
            result = {
                'id': safe_int(idx),
                'group': group,
                'hostname': str(row.get('hostname', row.get('host_name', 'Unknown'))),
                'username': str(row.get('username', row.get('user_name', 'Unknown'))),
                'process_name': str(row.get('process_name', 'Unknown')),
                'path': str(row.get('path', row.get('process_path', 'Unknown'))),
                'alert_severity': str(row.get('alert_severity', row.get('feed_rating', 'medium'))),
                'confidence': float(threat_probs[idx]),
                'basePriority': float(base_priority_score),
                'groupMultiplier': float(group_multiplier),
                'priorityScore': float(final_priority_score),
                'finalPriority': final_priority,
                'childproc_count': safe_int(row.get('childproc_count', row.get('crossproc_count', 0))),
                'netconn_count': safe_int(row.get('netconn_count', row.get('networkconn_count', 0))),
                'filemod_count': safe_int(row.get('filemod_count', 0)),
                'timestamp': datetime.now().isoformat(),
                'cmdline': str(row.get('cmdline', '')),
                'parent_name': str(row.get('parent_name', 'Unknown')),
                'sensor_id': safe_int(row.get('sensor_id', 0)),
                'process_pid': safe_int(row.get('process_pid', row.get('process_id', 0))),
                'parent_pid': safe_int(row.get('parent_pid', 0)),
                'ioc_type': str(row.get('ioc_type', 'Unknown')),
                'ioc_value': str(row.get('ioc_value', 'Unknown')),
                'feed_name': str(row.get('feed_name', 'Unknown'))
            }
            results.append(result)
        
        # Sort results by priority score (descending)
        results.sort(key=lambda x: x['priorityScore'], reverse=True)
        
        # Update statistics
        update_analysis_stats(len(df), len(results), priority_breakdown)
        
        logger.info(f"Analysis complete. Returning {len(results)} threat records")
        
        return JSONResponse({
            "totalProcessed": len(df),
            "threatsDetected": len(results),
            "filteredResults": results,
            "processingTime": "2.1s",
            "modelVersion": "2.0.0"
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/config/priority-rules")
async def save_priority_rules(rules: List[Dict[str, Any]]):
    """Save priority rules configuration"""
    try:
        # Convert rules list to multipliers dict
        multipliers = {}
        for rule in rules:
            multipliers[rule['group']] = rule['multiplier']
        
        current_config['groupMultipliers'] = multipliers
        save_config()  # Save to file
        
        logger.info(f"Updated group multipliers: {multipliers}")
        
        return {"success": True, "message": "Priority rules saved successfully"}
    except Exception as e:
        logger.error(f"Error saving priority rules: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save priority rules: {str(e)}")

@app.post("/config/analysis-settings")
async def save_analysis_settings(settings: Dict[str, Any]):
    """Save analysis settings configuration"""
    try:
        current_config['analysisSettings'].update(settings)
        save_config()  # Save to file
        
        logger.info(f"Updated analysis settings: {settings}")
        
        return {"success": True, "message": "Analysis settings saved successfully"}
    except Exception as e:
        logger.error(f"Error saving analysis settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save analysis settings: {str(e)}")

@app.get("/dashboard-stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        return JSONResponse({
            "totalAnalyses": current_stats['totalAnalyses'],
            "totalAlertsProcessed": current_stats['totalAlertsProcessed'],
            "totalThreatsDetected": current_stats['totalThreatsDetected'],
            "priorityBreakdown": current_stats['priorityBreakdown'],
            "lastAnalysisDate": current_stats['lastAnalysisDate'],
            "detectionRate": round((current_stats['totalThreatsDetected'] / max(current_stats['totalAlertsProcessed'], 1)) * 100, 2),
            "averageThreatsPerAnalysis": round(current_stats['totalThreatsDetected'] / max(current_stats['totalAnalyses'], 1), 2)
        })
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard stats: {str(e)}")

@app.delete("/dashboard-stats/reset")
async def reset_dashboard_stats():
    """Reset dashboard statistics"""
    try:
        global current_stats
        current_stats = DEFAULT_STATS.copy()
        current_stats['createdAt'] = datetime.now().isoformat()
        save_stats()
        
        logger.info("Dashboard statistics reset")
        return {"success": True, "message": "Statistics reset successfully"}
    except Exception as e:
        logger.error(f"Error resetting stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reset stats: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    models_loaded = binary_model is not None and priority_model is not None
    return {
        "status": "healthy" if models_loaded else "models_not_loaded",
        "modelsLoaded": models_loaded,
        "configLoaded": CONFIG_FILE.exists(),
        "statsLoaded": STATS_FILE.exists(),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/config")
async def get_config():
    """Get current configuration"""
    return {
        "groupMultipliers": current_config['groupMultipliers'],
        "analysisSettings": current_config['analysisSettings'],
        "modelInfo": {
            "binaryModel": "XGBClassifier v2.0" if binary_model else "Not loaded",
            "priorityModel": "RandomForestClassifier v2.0" if priority_model else "Not loaded",
            "modelsLoaded": binary_model is not None and priority_model is not None
        }
    }

# Load configuration and statistics on startup
@app.on_event("startup")
async def startup_event():
    load_config()
    load_stats()
    load_models()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)