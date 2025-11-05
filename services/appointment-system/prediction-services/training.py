# training.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import httpx
import asyncio
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

from config import settings

class EnhancedVehicleRepairModel:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.feature_names = None
        
    async def fetch_training_data(self):
        """Fetches comprehensive training data from the API."""
        print("Fetching enhanced training data from API...")
        
        if not settings.NODE_API_FINISHED_JOBS or "your_node_api" in settings.NODE_API_FINISHED_JOBS:
            print("ERROR: API URL not configured properly.")
            return []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(settings.NODE_API_FINISHED_JOBS)
                response.raise_for_status()
                data = response.json()
                print(f"Successfully fetched {len(data)} completed jobs.")
                return data
        except Exception as e:
            print(f"Error fetching training data: {e}")
            return []
    
    def debug_training_data(self, df: pd.DataFrame):
        """Debug function to analyze training data distribution."""
        if df.empty:
            print("No data to debug")
            return
        
        print("\n=== TRAINING DATA DEBUG INFO ===")
        print(f"Total samples: {len(df)}")
        print(f"Features: {list(df.columns)}")
        
        # Check target variable distribution
        if 'actual_duration_days' in df.columns:
            print(f"\nTarget variable (actual_duration_days) statistics:")
            print(f"Min: {df['actual_duration_days'].min()}")
            print(f"Max: {df['actual_duration_days'].max()}")
            print(f"Mean: {df['actual_duration_days'].mean():.2f}")
            print(f"Median: {df['actual_duration_days'].median()}")
            
            # Check by repair type
            if 'repairType' in df.columns:
                print(f"\nDuration by repair type:")
                for repair_type in df['repairType'].unique():
                    subset = df[df['repairType'] == repair_type]
                    if len(subset) > 0:
                        print(f"  {repair_type}: {len(subset)} samples, "
                              f"mean: {subset['actual_duration_days'].mean():.2f} days")
    
    def create_enhanced_features(self, data: list) -> pd.DataFrame:
        """Creates comprehensive features from raw data."""
        if not data:
            return pd.DataFrame()
            
        df = pd.DataFrame(data)
        
        
        # Required columns
        required_cols = ['vehicleType', 'vehicleBrand', 'repairType', 'millage', 
                        'lastServiceDate', 'startDate', 'endDate',
                        'vehicleModelYear', 'vehicleRegistrationYear']
        
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            print(f"Missing columns: {missing_cols}")
            # Don't fail completely, just print warning
            print("WARNING: Not all required columns are present. Model accuracy may suffer.")
        
        # Convert dates with error handling
        df['startDate'] = pd.to_datetime(df['startDate'], errors='coerce')
        df['endDate'] = pd.to_datetime(df['endDate'], errors='coerce')
        df['lastServiceDate'] = pd.to_datetime(df['lastServiceDate'], errors='coerce')
        
        # Remove rows with invalid dates
        initial_count = len(df)
        df = df[df['startDate'].notna() & df['endDate'].notna()]
        if len(df) < initial_count:
            print(f"Removed {initial_count - len(df)} rows with invalid dates")
        
        # Calculate target variable (actual duration in days)
        df['actual_duration_days'] = (df['endDate'] - df['startDate']).dt.days
        
        # Filter invalid data
        initial_count = len(df)
        df = df[df['actual_duration_days'] > 0]
        
    
        # Filter for obvious errors (e.g., > 60 days).
        df = df[df['actual_duration_days'] < 60]
        
        if len(df) < initial_count:
            print(f"Removed {initial_count - len(df)} rows with unrealistic durations")
        
        # Feature Engineering
        df = self._engineer_features(df)
        
        # Debug info
        self.debug_training_data(df)
        
        print(f"Created enhanced training data with {len(df)} samples and {len(df.columns)} features.")
        return df
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineers advanced features for better prediction."""
        
        # 1. Time-based features with proper error handling
        current_date = pd.Timestamp.now()
        
        # Days since last service with fallback
        df['days_since_last_service'] = (df['startDate'] - df['lastServiceDate']).dt.days
        df['days_since_last_service'] = df['days_since_last_service'].fillna(180)  # 6 months if unknown
        df['days_since_last_service'] = df['days_since_last_service'].clip(lower=0, upper=365*3)
        
        # Seasonal features
        df['month'] = df['startDate'].dt.month
        df['season'] = df['month'].map({
            12: 'winter', 1: 'winter', 2: 'winter',
            3: 'spring', 4: 'spring', 5: 'spring',
            6: 'summer', 7: 'summer', 8: 'summer',
            9: 'fall', 10: 'fall', 11: 'fall'
        })
        
        # 2. Vehicle age estimation (using REAL data)
        current_year = datetime.now().year
        
        # Convert years to numeric, handling errors
        df['vehicleModelYear'] = pd.to_numeric(df['vehicleModelYear'], errors='coerce')
        df['vehicleRegistrationYear'] = pd.to_numeric(df['vehicleRegistrationYear'], errors='coerce')
        
        # Use ModelYear first, fall back to RegistrationYear
        df['year_to_use'] = df['vehicleModelYear'].fillna(df['vehicleRegistrationYear'])
        
        # Calculate age
        df['vehicle_age'] = current_year - df['year_to_use']
        
        # Fill any remaining missing values (e.g., avg 5 years old) and clip to reasonable range
        df['vehicle_age'] = df['vehicle_age'].fillna(5).clip(lower=0, upper=30)
        
        # 3. Millage-based features
        df['millage'] = pd.to_numeric(df['millage'], errors='coerce').fillna(50000)
        df['millage'] = df['millage'].clip(lower=0, upper=300000)
        df['high_millage'] = (df['millage'] > settings.HIGH_MILLAGE_THRESHOLD).astype(int)
        df['millage_category'] = pd.cut(df['millage'], 
                                      bins=[0, 30000, 60000, 100000, 200000, float('inf')],
                                      labels=['very_low', 'low', 'medium', 'high', 'very_high'])
        
        # 4. Normalize text data
        df['vehicleType'] = df['vehicleType'].str.lower().fillna('sedan')
        df['vehicleBrand'] = df['vehicleBrand'].str.lower().fillna('unknown')
        df['repairType'] = df['repairType'].str.lower().fillna('general')
        
        # 5. Brand complexity
        premium_brands = ['mercedes', 'bmw', 'audi', 'lexus', 'volvo', 'jaguar']
        df['is_premium_brand'] = df['vehicleBrand'].isin(premium_brands).astype(int)
        
        # 6. Repair complexity
        complex_repairs = ['engine', 'transmission', 'electrical', 'hybrid', 'ev_system']
        df['is_complex_repair'] = df['repairType'].isin(complex_repairs).astype(int)
        
        # Select final features
        feature_columns = settings.MODEL_FEATURES + [
            'high_millage', 'is_premium_brand', 'is_complex_repair', 
            'month', 'millage_category'
        ]
        
        # Ensure we only use available columns
        available_features = [col for col in feature_columns if col in df.columns]
        available_features.append('actual_duration_days')
        
        return df[available_features]
    
    def create_preprocessor(self, df: pd.DataFrame):
        """Creates the preprocessing pipeline based on available features."""
        
        # Identify feature types
        numeric_features = []
        categorical_features = []
        
        # Dynamically find features from our settings list
        for feature in settings.MODEL_FEATURES:
            if feature in df.columns:
                if df[feature].dtype in ['int64', 'float64', 'int32', 'float32']:
                    numeric_features.append(feature)
                else:
                    categorical_features.append(feature)
        
        # Add engineered features
        engineered_numeric = ['high_millage', 'is_premium_brand', 'is_complex_repair', 'month']
        engineered_categorical = ['millage_category']
        
        numeric_features.extend([f for f in engineered_numeric if f in df.columns and f not in numeric_features])
        categorical_features.extend([f for f in engineered_categorical if f in df.columns and f not in categorical_features])
        
        # Remove duplicates
        numeric_features = list(set(numeric_features))
        categorical_features = list(set(categorical_features))
        
        print(f"Numeric features: {numeric_features}")
        print(f"Categorical features: {categorical_features}")
        
        # Create preprocessor
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
            ])
        
        return self.preprocessor
    
    def train_model(self, df: pd.DataFrame) -> bool:
        """Trains the enhanced model with comprehensive features."""
        
        if df.empty or 'actual_duration_days' not in df.columns:
            print("No data available for training.")
            return False
        
        # Prepare features and target
        X = df.drop('actual_duration_days', axis=1)
        y = df['actual_duration_days']
        
        # Create and fit preprocessor
        self.create_preprocessor(X)
        X_processed = self.preprocessor.fit_transform(X)
        
        # Get feature names after preprocessing
        feature_names = []
        try:
            if 'num' in self.preprocessor.named_transformers_:
                feature_names.extend(self.preprocessor.named_transformers_['num'].get_feature_names_out())
            if 'cat' in self.preprocessor.named_transformers_:
                feature_names.extend(self.preprocessor.named_transformers_['cat'].get_feature_names_out())
        except Exception:
            # Fallback for older sklearn versions
            feature_names = ["feature_" + str(i) for i in range(X_processed.shape[1])]
        
        self.feature_names = feature_names
        
        # Train multiple models and select the best one
        models = {
            'xgboost': XGBRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42,
                objective='reg:squarederror'
            ),
            'random_forest': RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                max_depth=8
            )
        }
        
        best_score = float('inf')
        best_model = None
        best_model_name = None
        
        for name, model in models.items():
            try:
                # Cross-validation
                cv_scores = cross_val_score(model, X_processed, y, 
                                          cv=5, scoring='neg_mean_squared_error')
                mse_score = -cv_scores.mean()
                
                print(f"{name} CV MSE: {mse_score:.2f}")
                
                if mse_score < best_score:
                    best_score = mse_score
                    best_model = model
                    best_model_name = name
            except Exception as e:
                print(f"Error training {name}: {e}")
        
        if best_model is None:
            print("No model could be trained successfully")
            return False
        
        # Train the best model on full data
        best_model.fit(X_processed, y)
        self.model = best_model
        
        # Final evaluation
        y_pred = best_model.predict(X_processed)
        mse = mean_squared_error(y, y_pred)
        mae = mean_absolute_error(y, y_pred)
        r2 = r2_score(y, y_pred)
        
        print(f"\n=== Model Training Complete ===")
        print(f"Best Model: {best_model_name}")
        print(f"Final MSE: {mse:.2f}")
        print(f"Final MAE: {mae:.2f}")
        print(f"R² Score: {r2:.2f}")
        print(f"Feature Importance: {len(self.feature_names)} features")
        
        return True
    
    def save_model(self):
        """Saves the complete model pipeline."""
        model_artifact = {
            'model': self.model,
            'preprocessor': self.preprocessor,
            'feature_names': self.feature_names,
            'training_date': datetime.now().isoformat()
        }
        
        joblib.dump(model_artifact, settings.MODEL_FILE)
        print(f"Enhanced model saved to {settings.MODEL_FILE}")
    
    def load_model(self):
        """Loads the complete model pipeline."""
        try:
            artifact = joblib.load(settings.MODEL_FILE)
            self.model = artifact['model']
            self.preprocessor = artifact['preprocessor']
            self.feature_names = artifact['feature_names']
            print("Enhanced model loaded successfully.")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False

async def train_enhanced_model():
    """Main training function."""
    print("Starting enhanced model training...")
    
    trainer = EnhancedVehicleRepairModel()
    
    # Fetch data
    raw_data = await trainer.fetch_training_data()
    if not raw_data:
        print("No data fetched. Training aborted.")
        return False
    
    # Create features
    df = trainer.create_enhanced_features(raw_data)
    if df.empty:
        print("No valid features created. Training aborted.")
        return False
    
    # Train model
    success = trainer.train_model(df)
    if success:
        trainer.save_model()
    
    return success

if __name__ == "__main__":
    asyncio.run(train_enhanced_model())