from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"status": "API Vital funcionando"}

@app.get("/health")
def health():
    return {"ok": True}
