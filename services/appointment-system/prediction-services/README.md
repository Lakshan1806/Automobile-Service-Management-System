# Vehicle Scheduling Prediction Services

AI-powered scheduling system for vehicle repair workshops using FastAPI and XGBoost.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd prediction-services

2.
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

3.
pip install -r requirements.txt

4.
cp .env.example .env
# Edit .env with your actual configuration

5.
NODE_API_FINISHED_JOBS=http://your-actual-node-api/api/appointments?status=FINISHED
NODE_API_ALL_JOBS=http://your-actual-node-api/api/appointments/active

6.
python training.py

7.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
