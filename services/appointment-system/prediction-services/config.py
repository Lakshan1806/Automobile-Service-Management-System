# config.py
import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # --- ADD THESE ---
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    PREDICTION_EVENTS_TOPIC: str = "prediction_events"

    # FastAPI Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Node.js API URLs
    NODE_API_FINISHED_JOBS: str = os.getenv("NODE_API_FINISHED_JOBS", "")
    NODE_API_ALL_JOBS: str = os.getenv("NODE_API_ALL_JOBS", "")
    
    # Model Configuration
    MODEL_RETRAIN_HOURS: int = int(os.getenv("MODEL_RETRAIN_HOURS", 12))
    MODEL_FILE: str = os.getenv("MODEL_FILE", "enhanced_duration_model.joblib")
    
    # Workshop Resources
    WORKSHOP_RESOURCES: Dict[str, int] = {
        "engine_bay": int(os.getenv("ENGINE_BAY_COUNT", 2)),
        "general_bay": int(os.getenv("GENERAL_BAY_COUNT", 4)),
        "tire_lift": int(os.getenv("TIRE_LIFT_COUNT", 2)),
        "engine_specialist": int(os.getenv("ENGINE_SPECIALIST_COUNT", 2)),
        "general_tech": int(os.getenv("GENERAL_TECH_COUNT", 5))
    }
    
    # Repair Requirements
    REPAIR_REQUIREMENTS: Dict[str, Dict[str, int]] = {
        "engine": {
            "engine_bay": 1,
            "engine_specialist": 1
        },
        "tyre": {
            "tire_lift": 1,
            "general_tech": 1
        },
        "tire": {
            "tire_lift": 1,
            "general_tech": 1
        },
        "full-service": {
            "general_bay": 1,
            "general_tech": 1
        },
        "brake": {
            "general_bay": 1,
            "general_tech": 1
        },
        "electrical": {
            "general_bay": 1,
            "general_tech": 1
        },
        "transmission": {
            "engine_bay": 1,
            "engine_specialist": 1
        },
        "__default__": {
            "general_bay": 1,
            "general_tech": 1
        }
    }
    
    # Model Features Configuration
    MODEL_FEATURES: list = [
        'vehicleType', 'vehicleBrand', 'repairType', 'millage', 
        'days_since_last_service', 'vehicle_age', 'season'
    ]
    
    # Feature Engineering Parameters
    HIGH_MILLAGE_THRESHOLD: int = 100000
    OLD_VEHICLE_THRESHOLD: int = 10

settings = Settings()