from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(title="Vital Signs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_data = {
    "heartRate": None,
    "spO2": None,
    "temperature": None,
    "timestamp": None
}

@app.get("/")
def root():
    return {"status": "API running"}

@app.post("/vitals")
def receive_vitals(data: dict):
    global latest_data
    latest_data = {
        "heartRate": data.get("heartRate"),
        "spO2": data.get("spO2"),
        "temperature": data.get("temperature"),
        "timestamp": datetime.now().isoformat()
    }
    return {"status": "ok"}

@app.get("/vitals")
def get_vitals():
    return latest_data

@app.post("/start")
def start_measurement():
    return {"command": "START"}

@app.post("/stop")
def stop_measurement():
    return {"command": "STOP"}
