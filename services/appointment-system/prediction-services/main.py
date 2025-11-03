# main.py
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
import joblib
import pandas as pd
from datetime import datetime, timedelta
import httpx
import asyncio
from typing import Optional, List, Dict

# Configuration and custom modules
from config import settings
from training import train_model

# APScheduler for automated training
from apscheduler.schedulers.asyncio import AsyncIOScheduler

app = FastAPI(
    title="Vehicle Scheduling Prediction API",
    description="AI-powered scheduling system for vehicle repair workshops",
    version="1.0.0"
)

# Global model variable
duration_model = None

def load_model():
    """Loads the model from disk into the global variable."""
    global duration_model
    try:
        duration_model = joblib.load(settings.MODEL_FILE)
        print("Duration model loaded successfully.")
    except FileNotFoundError:
        print(f"WARNING: {settings.MODEL_FILE} not found.")
        print("Running initial training...")
        try:
            train_model()
            duration_model = joblib.load(settings.MODEL_FILE)
            print("Initial model trained and loaded.")
        except Exception as e:
            print(f"FATAL: Initial training failed: {e}")
            duration_model = None
    except Exception as e:
        print(f"Error loading model: {e}")
        duration_model = None

def scheduled_retrain():
    """The function that the scheduler will call."""
    print("Scheduler starting periodic re-train...")
    try:
        train_model()
        load_model()  # Reload the new model into memory
        print("Periodic re-train finished. Model reloaded.")
    except Exception as e:
        print(f"Periodic re-train failed: {e}")

@app.on_event("startup")
async def startup_event():
    """Runs when the API server starts up."""
    # 1. Load the model
    load_model()
    
    # 2. Start the scheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(scheduled_retrain, 'interval', hours=settings.MODEL_RETRAIN_HOURS)
    scheduler.start()
    print(f"Scheduler started. Model will retrain every {settings.MODEL_RETRAIN_HOURS} hours.")

# Pydantic Models
class RepairRequest(BaseModel):
    vehicleType: str
    repairType: str

class DurationResponse(BaseModel):
    predicted_duration_days: int

class ScheduleResponse(BaseModel):
    suggested_start_date: str
    predicted_duration_days: int

class NodeJob(BaseModel):
    vehicleType: str
    repairType: str
    startDate: datetime
    endDate: Optional[datetime] = None
    status: str

# Internal Functions
async def get_predicted_duration(request: RepairRequest) -> int:
    if duration_model is None:
        print("ERROR: get_predicted_duration called but model is not loaded.")
        raise HTTPException(status_code=503, detail="Model is not available. Please try again later.")
        
    input_df = pd.DataFrame([request.dict()])
    try:
        duration = duration_model.predict(input_df)[0]
        return int(round(duration))
    except Exception as e:
        print(f"Prediction error: {e}. Defaulting to 1 day.")
        return 1

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Vehicle Scheduling Prediction API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    model_status = "loaded" if duration_model is not None else "not loaded"
    return {
        "status": "healthy",
        "model_status": model_status,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict_duration", response_model=DurationResponse)
async def predict_duration(request: RepairRequest):
    """Predict the duration of a repair in days."""
    duration = await get_predicted_duration(request)
    return {"predicted_duration_days": duration}

@app.post("/suggest_start_date", response_model=ScheduleResponse)
async def suggest_start_date(request: RepairRequest):
    """Finds the next available start date based on predicted duration and resource availability."""
    
    # Check if API URLs are configured
    if not settings.NODE_API_ALL_JOBS or "your_node_api" in settings.NODE_API_ALL_JOBS:
        raise HTTPException(
            status_code=500, 
            detail="Node.js API URL not configured. Please check your environment variables."
        )
    
    needed_duration = await get_predicted_duration(request)
    new_job_reqs = settings.REPAIR_REQUIREMENTS.get(
        request.repairType, 
        settings.REPAIR_REQUIREMENTS["__default__"]
    )

    # Get all ongoing and scheduled jobs
    try:
        async with httpx.AsyncClient() as client:
            all_jobs_resp = await client.get(settings.NODE_API_ALL_JOBS)
            all_jobs_resp.raise_for_status()
            all_jobs = [NodeJob(**job) for job in all_jobs_resp.json()]
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch jobs from Node.js API: {e}"
        )

    # Build busy schedule with resource requirements
    busy_schedule = []
    for job in all_jobs:
        if job.status in ['Ongoing', 'Scheduled']:
            start_date = job.startDate
            end_date = job.endDate

            if end_date is None:
                ongoing_request = RepairRequest(
                    vehicleType=job.vehicleType, 
                    repairType=job.repairType
                )
                ongoing_duration = await get_predicted_duration(ongoing_request)
                end_date = start_date + timedelta(days=ongoing_duration)
            
            job_reqs = settings.REPAIR_REQUIREMENTS.get(
                job.repairType, 
                settings.REPAIR_REQUIREMENTS["__default__"]
            )
            
            busy_schedule.append({
                "start": start_date,
                "end": end_date,
                "requirements": job_reqs
            })

    # Scheduling algorithm
    check_date = pd.to_datetime('today').normalize() + timedelta(days=1)
    
    while True:
        is_slot_available = True
        potential_end_date = check_date + timedelta(days=needed_duration - 1)
        
        for day in pd.date_range(start=check_date, end=potential_end_date):
            resources_used_today = {
                resource: 0 for resource in settings.WORKSHOP_RESOURCES
            }
            
            for job in busy_schedule:
                if job["start"].date() <= day.date() <= job["end"].date():
                    for resource, amount in job["requirements"].items():
                        resources_used_today[resource] += amount
            
            # Check if we can add the new job
            for resource, needed_amount in new_job_reqs.items():
                available = settings.WORKSHOP_RESOURCES[resource]
                used = resources_used_today[resource]
                
                if (used + needed_amount) > available:
                    is_slot_available = False
                    break
            
            if not is_slot_available:
                break
        
        if is_slot_available:
            return {
                "suggested_start_date": check_date.strftime('%Y-%m-%d'),
                "predicted_duration_days": needed_duration
            }
        
        check_date += timedelta(days=1)

@app.post("/trigger_retrain")
async def trigger_training(background_tasks: BackgroundTasks):
    """Manual endpoint to trigger model retraining."""
    print("Manual training triggered via API.")
    background_tasks.add_task(scheduled_retrain)
    return {"message": "Model retraining started in the background."}