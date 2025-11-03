# config.py
import os
from typing import Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # FastAPI Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Node.js API URLs
    NODE_API_FINISHED_JOBS: str = os.getenv("NODE_API_FINISHED_JOBS", "")
    NODE_API_ALL_JOBS: str = os.getenv("NODE_API_ALL_JOBS", "")
    
    # Model Configuration
    MODEL_RETRAIN_HOURS: int = int(os.getenv("MODEL_RETRAIN_HOURS", 12))
    MODEL_FILE: str = os.getenv("MODEL_FILE", "duration_model.joblib")
    
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
        "Engine": {
            "engine_bay": 1,
            "engine_specialist": 1
        },
        "Tyre": {
            "tire_lift": 1,
            "general_tech": 1
        },
        "Full-service": {
            "general_bay": 1,
            "general_tech": 1
        },
        "Brake": {
            "general_bay": 1,
            "general_tech": 1
        },
        "Electrical": {
            "general_bay": 1,
            "general_tech": 1
        },
        "Transmission": {
            "engine_bay": 1,
            "engine_specialist": 1
        },
        "__default__": {
            "general_bay": 1,
            "general_tech": 1
        }
    }

# Create settings instance
settings = Settings()