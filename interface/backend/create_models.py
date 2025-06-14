import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

def create_binary_model():
    """Create and save binary classification model"""
    print("Creating binary classification model...")
    
    # Load dataset
    df = pd.read_excel("data.xlsx")
    
    # Drop unnecessary columns
    drop_cols = [
        "Unnamed: 0", "created_time", "comms_ip", "description", "feed_name", "sha256", "incident",
        "process_guid", "status", "unique_id", "watchlist_id", "watchlist_name"
    ]
    
    df = df.drop(columns=drop_cols, errors='ignore')
    
    # Convert categorical variables
    df = pd.get_dummies(df)
    
    # Separate features and target
    X = df.drop(columns=["labelisation"])
    y = df["labelisation"]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Balance with SMOTE
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_scaled, y)
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
    )
    
    # Train XGBoost model
    xgb_model = XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42
    )
    
    xgb_model.fit(X_train, y_train)
    
    # Save model and scaler
    os.makedirs("models", exist_ok=True)
    joblib.dump(xgb_model, "models/binary_model.pkl")
    joblib.dump(scaler, "models/scaler.pkl")
    
    # Save feature names for later use
    feature_names = X.columns.tolist()
    joblib.dump(feature_names, "models/feature_names.pkl")
    
    print(f"Binary model saved with {len(feature_names)} features")
    return xgb_model, scaler, feature_names

def create_priority_model():
    """Create and save priority classification model"""
    print("Creating priority classification model...")
    
    # Load dataset
    df = pd.read_excel("data.xlsx")
    
    # Drop unnecessary columns
    drop_cols = [
        "Unnamed: 0", "created_time", "comms_ip", "description", "feed_name", "sha256", "labelisation",
        "process_guid", "status", "unique_id", "watchlist_id", "watchlist_name"
    ]
    
    df = df.drop(columns=drop_cols, errors='ignore')
    
    # Convert categorical variables
    df = pd.get_dummies(df)
    
    # Separate features and target
    X = df.drop(columns=["incident"])
    y = df["incident"]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Balance with SMOTE
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_scaled, y)
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
    )
    
    # Train RandomForest model
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        class_weight="balanced",
        random_state=42
    )
    
    rf_model.fit(X_train, y_train)
    
    # Save model
    joblib.dump(rf_model, "models/priority_model.pkl")
    joblib.dump(scaler, "models/priority_scaler.pkl")
    
    # Save feature names for later use
    feature_names = X.columns.tolist()
    joblib.dump(feature_names, "models/priority_feature_names.pkl")
    
    print(f"Priority model saved with {len(feature_names)} features")
    return rf_model, scaler, feature_names

if __name__ == "__main__":
    # Create models directory
    os.makedirs("models", exist_ok=True)
    
    # Create both models
    binary_model, binary_scaler, binary_features = create_binary_model()
    priority_model, priority_scaler, priority_features = create_priority_model()
    
    print("All models created successfully!")
    print(f"Binary model features: {len(binary_features)}")
    print(f"Priority model features: {len(priority_features)}")