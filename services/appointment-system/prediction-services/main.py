# main.py

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import httpx
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import settings
from training import EnhancedVehicleRepairModel, train_enhanced_model

app = FastAPI(
    title="Enhanced Vehicle Scheduling Prediction API",
    description="AI-powered scheduling system with comprehensive feature analysis",
    version="2.0.0"
)

# Global model handler
model_handler = EnhancedVehicleRepairModel()

# Pydantic Models for Enhanced Input
class EnhancedRepairRequest(BaseModel):
    vehicleType: str
    vehicleBrand: str
    repairType: str
    millage: int
    lastService: str  # Format: "dd-MM-yyyy"
    vehicleModelYear: int 
    
    @validator('lastService')
    def validate_last_service(cls, v):
        try:
            datetime.strptime(v, "%d-%m-%Y")
            return v
        except ValueError:
            raise ValueError("lastService must be in format dd-MM-yyyy")

class DurationResponse(BaseModel):
    predictedDuration: int
    confidence: float
    features_used: List[str]

class ScheduleResponse(BaseModel):
    suggestedStartDate: str
    predictedDuration: int
    confidence: float

class ResourceUpdateRequest(BaseModel):
    resource_type: str
    new_count: int

class RepairRequirementUpdateRequest(BaseModel):
    repair_type: str
    requirements: Dict[str, int]

class ConfigurationResponse(BaseModel):
    workshop_resources: Dict[str, int]
    repair_requirements: Dict[str, Dict[str, int]]
    model_features: List[str]

# Enhanced Prediction Functions
def create_prediction_features(request: EnhancedRepairRequest) -> pd.DataFrame:
    """Creates features for prediction from request data."""
    
    # Convert last service date
    last_service_date = datetime.strptime(request.lastService, "%d-%m-%Y")
    days_since_service = (datetime.now() - last_service_date).days
    
    # Normalize inputs
    vehicle_type = request.vehicleType.lower()
    vehicle_brand = request.vehicleBrand.lower()
    repair_type = request.repairType.lower()
    
    # --- Calculate real vehicle age ---
    current_year = datetime.now().year
    vehicle_age = current_year - request.vehicleModelYear
    vehicle_age = max(0, min(30, vehicle_age)) # Clip to reasonable values
    # ---
    
    # Create base features
    features = {
        'vehicleType': vehicle_type,
        'vehicleBrand': vehicle_brand,
        'repairType': repair_type,
        'millage': request.millage,
        'days_since_last_service': max(0, days_since_service),
        'vehicle_age': vehicle_age,  # Use calculated age
        'season': get_current_season(),
        'high_millage': int(request.millage > settings.HIGH_MILLAGE_THRESHOLD),
        'is_premium_brand': int(vehicle_brand in ['mercedes', 'bmw', 'audi', 'lexus', 'volvo']),
        'is_complex_repair': int(repair_type in ['engine', 'transmission', 'electrical', 'hybrid']),
        'month': datetime.now().month
    }
    
    # Ensure correct feature order
    final_features = {}
    
    # Get all potential feature names from the model preprocessor if available
    if model_handler.preprocessor:
        all_feature_names = []
        try:
            if 'num' in model_handler.preprocessor.named_transformers_:
                all_feature_names.extend(model_handler.preprocessor.named_transformers_['num'].get_feature_names_out())
            if 'cat' in model_handler.preprocessor.named_transformers_:
                all_feature_names.extend(model_handler.preprocessor.named_transformers_['cat'].get_feature_names_out())
        except Exception:
             pass # Will just use the feature dict keys
        
        # We only need the *original* feature names, not the one-hot encoded ones
        original_features_needed = set(settings.MODEL_FEATURES)
        original_features_needed.update(['high_millage', 'is_premium_brand', 'is_complex_repair', 'month', 'millage_category'])
        
        for f_name in original_features_needed:
            if f_name in features:
                final_features[f_name] = features[f_name]
    else:
        final_features = features

    return pd.DataFrame([final_features])

def get_current_season() -> str:
    """Determine current season."""
    month = datetime.now().month
    if month in [12, 1, 2]:
        return 'winter'
    elif month in [3, 4, 5]:
        return 'spring'
    elif month in [6, 7, 8]:
        return 'summer'
    else:
        return 'fall'

def get_fallback_duration(request: EnhancedRepairRequest) -> int:
    """Realistic fallback duration calculation when model fails."""
    
    # Convert to lowercase for consistent comparison
    repair_type = request.repairType.lower()
    vehicle_brand = request.vehicleBrand.lower()
    
    # Base durations (in days) - REALISTIC VALUES
    base_durations = {
        'tyre': 1,
        'tire': 1,
        'brake': 2,
        'electrical': 3,
        'full-service': 2,
        'full service': 2,
        'engine': 5,
        'transmission': 4,
        'oil change': 1,
        'general': 2,
        'suspension': 3,
        'exhaust': 2,
        'ac': 2
    }
    
    # Get base duration - default to 2 days
    base_duration = 2
    for repair_key, duration in base_durations.items():
        if repair_key in repair_type:
            base_duration = duration
            break
    
    # Adjust for millage
    if request.millage > 150000:
        base_duration += 1
    elif request.millage > 100000:
        base_duration += 0.5  # Minor adjustment
    
    # Adjust for premium brands (slightly longer for complex vehicles)
    premium_brands = ['mercedes', 'bmw', 'audi', 'lexus', 'volvo']
    if any(brand in vehicle_brand for brand in premium_brands):
        if repair_type in ['engine', 'transmission', 'electrical']:
            base_duration += 1
    
    # Adjust for age
    current_year = datetime.now().year
    if (current_year - request.vehicleModelYear) > 10:
        base_duration += 1
    
    # Ensure reasonable duration
    base_duration = max(1, min(10, base_duration))  # Between 1-10 days
    
    return int(round(base_duration))

async def get_enhanced_prediction(request: EnhancedRepairRequest) -> tuple:
    """Get prediction with confidence estimation."""
    
    # For the Initial Phase - because of not enough data for the Model
    # QUICK FIX: Force simple repairs to realistic durations
    simple_repairs = ['tyre', 'tire', 'oil change', 'general']
    if request.repairType.lower() in simple_repairs:
        return 1, 0.9
    
    if model_handler.model is None or model_handler.preprocessor is None:
        # Use fallback if model not available
        fallback_duration = get_fallback_duration(request)
        return fallback_duration, 0.7
    
    try:
        # Create features
        input_df = create_prediction_features(request)
        
        # Preprocess
        X_processed = model_handler.preprocessor.transform(input_df)
        
        # Predict
        raw_duration = model_handler.model.predict(X_processed)[0]
        duration = max(1, int(round(raw_duration)))
        
        # For the Initial Phase - because of not enough data for the Model
        # Ensure realistic durations
        if request.repairType.lower() in ['tyre', 'tire'] and duration > 2:
            duration = 1
        elif request.repairType.lower() in ['brake', 'oil change'] and duration > 3:
            duration = 2
        
        # Confidence estimation
        base_confidence = 0.8
        # Higher confidence for shorter, common repairs
        if duration <= 2:
            base_confidence += 0.1
        # Lower confidence for very long durations
        if duration > 7:
            base_confidence -= 0.2
        
        confidence = min(0.95, max(0.5, base_confidence))
        
        return duration, confidence
        
    except Exception as e:
        print(f"Prediction error: {e}")
        # Fallback to simple rules
        fallback_duration = get_fallback_duration(request)
        return fallback_duration, 0.5

# API Management Endpoints
@app.post("/api/admin/resources")
async def update_workshop_resources(update: ResourceUpdateRequest):
    """Update workshop resource counts dynamically."""
    if update.resource_type not in settings.WORKSHOP_RESOURCES:
        raise HTTPException(status_code=400, detail=f"Invalid resource type: {update.resource_type}")
    
    settings.WORKSHOP_RESOURCES[update.resource_type] = update.new_count
    return {"message": f"Resource {update.resource_type} updated to {update.new_count}"}

@app.post("/api/admin/repair-requirements")
async def update_repair_requirements(update: RepairRequirementUpdateRequest):
    """Update repair type requirements dynamically."""
    settings.REPAIR_REQUIRIMENTS[update.repair_type] = update.requirements
    return {"message": f"Requirements for {update.repair_type} updated"}

@app.get("/api/admin/configuration", response_model=ConfigurationResponse)
async def get_current_configuration():
    """Get current system configuration."""
    return ConfigurationResponse(
        workshop_resources=settings.WORKSHOP_RESOURCES,
        repair_requirements=settings.REPAIR_REQUIREMENTS,
        model_features=settings.MODEL_FEATURES
    )

# Enhanced API Endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize application."""
    # Load model
    if not model_handler.load_model():
        print("WARNING: Could not load existing model. Triggering initial training in background.")
        # Start training in the background so it doesn't block startup
        asyncio.create_task(scheduled_retrain())
    
    # Start scheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(scheduled_retrain, 'interval', hours=settings.MODEL_RETRAIN_HOURS)
    scheduler.start()
    print(f"Scheduler started. Retraining every {settings.MODEL_RETRAIN_HOURS} hours.")

@app.get("/")
async def root():
    return {
        "message": "Enhanced Vehicle Scheduling Prediction API",
        "status": "running",
        "version": "2.0.0",
        "features": "comprehensive ML model with dynamic configuration"
    }

@app.get("/health")
async def health_check():
    model_status = "loaded" if model_handler.model is not None else "not loaded"
    return {
        "status": "healthy",
        "model_status": model_status,
        "configuration_loaded": True,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict/duration", response_model=DurationResponse)
async def predict_enhanced_duration(request: EnhancedRepairRequest):
    """Enhanced duration prediction with comprehensive features."""
    duration, confidence = await get_enhanced_prediction(request)
    
    return DurationResponse(
        predictedDuration=duration,
        confidence=round(confidence, 2),
        features_used=settings.MODEL_FEATURES
    )

@app.post("/schedule/suggest-start", response_model=ScheduleResponse)
async def suggest_enhanced_start_date(request: EnhancedRepairRequest):
    """Enhanced scheduling with comprehensive prediction."""
    
    if not settings.NODE_API_ALL_JOBS or "your_node_api" in settings.NODE_API_ALL_JOBS:
        raise HTTPException(status_code=500, detail="API not configured")
    
    # Get enhanced prediction
    needed_duration, confidence = await get_enhanced_prediction(request)
    
    # Normalize repair type for requirements lookup
    repair_type = request.repairType.lower()
    new_job_reqs = settings.REPAIR_REQUIREMENTS.get(
        repair_type, 
        settings.REPAIR_REQUIREMENTS["__default__"]
    )

    # Fetch current jobs
    try:
        async with httpx.AsyncClient() as client:
            all_jobs_resp = await client.get(settings.NODE_API_ALL_JOBS)
            all_jobs_resp.raise_for_status()
            all_jobs = all_jobs_resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {e}")

    # Build busy schedule
    busy_schedule = []
    for job in all_jobs:
        if job.get('status') in ['Ongoing', 'Scheduled']:
            start_date = pd.to_datetime(job['startDate'])
            end_date = pd.to_datetime(job['endDate']) if job.get('endDate') else None
            
            if end_date is None:
                # Estimate end date for ongoing jobs
                try:
                    # Added vehicleModelYear to the ongoing job estimation
                    default_model_year = datetime.now().year - 5 # Assume 5 years old if data is missing
                    ongoing_request = EnhancedRepairRequest(
                        vehicleType=job.get('vehicleType', 'sedan'),
                        vehicleBrand=job.get('vehicleBrand', 'unknown'),
                        repairType=job.get('repairType', 'general'),
                        millage=job.get('millage', 50000),
                        lastService=job.get('lastServiceDate', datetime.now().strftime("%d-%m-%Y")),
                        vehicleModelYear=job.get('vehicleModelYear', default_model_year)
                    )
                    ongoing_duration, _ = await get_enhanced_prediction(ongoing_request)
                    end_date = start_date + timedelta(days=ongoing_duration)
                except Exception as e:
                    print(f"Error estimating end date for job: {e}")
                    continue
            
            job_repair_type = job.get('repairType', 'general').lower()
            job_reqs = settings.REPAIR_REQUIRIMENTS.get(
                job_repair_type, 
                settings.REPAIR_REQUIREMENTS["__default__"]
            )
            
            busy_schedule.append({
                "start": start_date,
                "end": end_date,
                "requirements": job_reqs
            })

    # Find available slot - start from tomorrow
    check_date = pd.to_datetime('today').normalize() + timedelta(days=1)
    max_check_days = 30  # Don't look more than 1 month ahead
    
    for day_offset in range(max_check_days):
        current_check_date = check_date + timedelta(days=day_offset)
        potential_end_date = current_check_date + timedelta(days=needed_duration - 1)
        is_slot_available = True
        
        # Check each day in the potential booking period
        for day in pd.date_range(start=current_check_date, end=potential_end_date):
            resources_used_today = {resource: 0 for resource in settings.WORKSHOP_RESOURCES}
            
            # Calculate resource usage for this day from existing jobs
            for job in busy_schedule:
                if job["start"].date() <= day.date() <= job["end"].date():
                    for resource, amount in job["requirements"].items():
                        if resource in resources_used_today:
                            resources_used_today[resource] += amount
            
            # Check if we can add the new job
            for resource, needed_amount in new_job_reqs.items():
                if resource not in settings.WORKSHOP_RESOURCES:
                    continue
                    
                available = settings.WORKSHOP_RESOURCES[resource]
                used = resources_used_today[resource]
                
                if (used + needed_amount) > available:
                    is_slot_available = False
                    break
            
            if not is_slot_available:
                break
        
        if is_slot_available:
            return ScheduleResponse(
                suggestedStartDate=current_check_date.strftime('%Y-%m-%d'),
                predictedDuration=needed_duration,
                confidence=round(confidence, 2)
            )
    
    raise HTTPException(status_code=404, detail="No available slots found in the next 30 days")

@app.post("/training/trigger")
async def trigger_training(background_tasks: BackgroundTasks):
    """Manual training trigger."""
    background_tasks.add_task(scheduled_retrain)
    return {"message": "Enhanced model training started in background"}

@app.get("/model/info")
async def get_model_info():
    """Get information about the current model."""
    if model_handler.model is None:
        raise HTTPException(status_code=404, detail="No model loaded")
    
    return {
        "model_type": type(model_handler.model).__name__,
        "features_used": model_handler.feature_names if model_handler.feature_names else [],
        "preprocessor_available": model_handler.preprocessor is not None,
        "training_date": "Unknown" # You could save this in the model artifact
    }

@app.post("/debug/prediction")
async def debug_prediction(request: EnhancedRepairRequest):
    """Debug endpoint to understand prediction behavior."""
    
    # Create features
    input_df = create_prediction_features(request)
    
    print(f"\n=== PREDICTION DEBUG ===")
    print(f"Input features:")
    for col, value in input_df.iloc[0].items():
        print(f"  {col}: {value}")
    
    # Get model prediction
    model_duration = None
    if model_handler.model is not None and model_handler.preprocessor is not None:
        try:
            X_processed = model_handler.preprocessor.transform(input_df)
            raw_prediction = model_handler.model.predict(X_processed)[0]
            model_duration = max(1, int(round(raw_prediction)))
            print(f"Raw model prediction: {raw_prediction:.2f} days")
            print(f"Rounded model prediction: {model_duration} days")
        except Exception as e:
            print(f"Model prediction error: {e}")
    
    # Get fallback
    fallback = get_fallback_duration(request)
    print(f"Fallback duration: {fallback} days")
    
    # Get final prediction
    final_duration, confidence = await get_enhanced_prediction(request)
    print(f"Final prediction: {final_duration} days (confidence: {confidence})")
    
    return {
        "input_features": input_df.iloc[0].to_dict(),
        "model_prediction": model_duration,
        "fallback_duration": fallback,
        "final_prediction": final_duration,
        "confidence": confidence
    }

def scheduled_retrain():
    """Scheduled retraining function."""
    print("Starting scheduled retraining...")
    try:
        # We need to run the async function in a new event loop for a scheduled job
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        success = loop.run_until_complete(train_enhanced_model())
        
        if success:
            model_handler.load_model()  # Reload the new model
            print("Scheduled retraining completed successfully.")
        else:
            print("Scheduled retraining failed.")
    except Exception as e:
        print(f"Scheduled retraining error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)