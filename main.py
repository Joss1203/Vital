from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

# Base de datos simple en memoria (luego se cambia por Azure DB)
DATA = []

@app.post("/addData")
def add_data(payload: dict):
    payload["timestamp"] = datetime.utcnow().isoformat()
    DATA.append(payload)
    return {"status": "ok"}

@app.get("/getData")
def get_data():
    return DATA
 