from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/")
def root():
    return {"mensaje": "API Vital en Azure funcionando"}

@app.post("/datos")
def recibir_datos(data: dict):
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "datos": data
    }
