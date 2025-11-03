# training.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error
import joblib
import httpx
import asyncio

# Configuration
from config import settings

async def fetch_finished_data():
    """Fetches only completed jobs to use as training data."""
    print("Fetching finished job data from Node.js API...")
    
    # Check if API URL is configured
    if not settings.NODE_API_FINISHED_JOBS or "your_node_api" in settings.NODE_API_FINISHED_JOBS:
        print("ERROR: Node.js API URL not configured. Please check your .env file.")
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(settings.NODE_API_FINISHED_JOBS)
            response.raise_for_status()
            data = response.json()
            print(f"Successfully fetched {len(data)} finished jobs.")
            return data
    except httpx.RequestError as e:
        print(f"Error fetching data from Node.js API: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error fetching data: {e}")
        return []

def create_features(data: list) -> pd.DataFrame:
    """Converts raw JSON data into a clean DataFrame for training."""
    if not data:
        print("No data provided to create features.")
        return pd.DataFrame()
        
    df = pd.DataFrame(data)
    
    # Ensure required columns exist
    required_columns = ['vehicleType', 'repairType', 'startDate', 'endDate']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        print(f"Missing required columns: {missing_columns}")
        return pd.DataFrame()
    
    # Convert dates and calculate duration
    df['startDate'] = pd.to_datetime(df['startDate'])
    df['endDate'] = pd.to_datetime(df['endDate'])
    df['duration_days'] = (df['endDate'] - df['startDate']).dt.days
    
    # Filter and select features
    df = df[['vehicleType', 'repairType', 'duration_days']]
    df = df[df['duration_days'] > 0]
    
    print(f"Created training data with {len(df)} valid jobs.")
    return df

def train_model():
    """Fetches data, trains the new XGBoost model, and saves it."""
    
    print("Starting new XGBoost model training process...")
    
    # 1. Get and process data
    raw_data = asyncio.run(fetch_finished_data())
    df = create_features(raw_data)
    
    if df.empty:
        print("No training data available. Aborting training.")
        return False

    # 2. Define features and target
    categorical_features = ['vehicleType', 'repairType']
    X = df[categorical_features]
    y = df['duration_days']

    # 3. Create preprocessing and model pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            random_state=42,
            objective='reg:squarederror'
        ))
    ])

    # 4. Train the model
    model_pipeline.fit(X, y)

    # 5. Evaluate model
    y_pred = model_pipeline.predict(X)
    mse = mean_squared_error(y, y_pred)
    print(f"Model trained successfully. Training MSE: {mse:.2f}")

    # 6. Save the model
    joblib.dump(model_pipeline, settings.MODEL_FILE)
    print(f"Model saved to disk as {settings.MODEL_FILE}")
    return True

if __name__ == "__main__":
    train_model()