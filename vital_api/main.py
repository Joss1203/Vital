from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, date
import sqlite3
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

import os

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas   # 👈 ESTE ES EL IMPORT QUE FALTA

app = FastAPI()

DB = "vital.db"
medicion_activa = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class Medicion(BaseModel):
    bpm: int
    spo2: int
    temperatura: float


def guardar_datos(m: Medicion):
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO mediciones (fecha, bpm, spo2, temperatura) VALUES (?, ?, ?, ?)",
        (datetime.now().isoformat(), m.bpm, m.spo2, m.temperatura)
    )
    conn.commit()
    conn.close()


@app.get("/")
def root():
    return {"mensaje": "API Vital funcionando"}


@app.post("/datos")
def recibir_datos(data: Medicion):
    if not medicion_activa:
        return {
            "status": "ignorado",
            "mensaje": "Medición no activada"
        }

    guardar_datos(data)
    return {
        "status": "guardado",
        "datos": data
    }


@app.get("/datos")
def obtener_datos():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mediciones ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r[0],
            "fecha": r[1],
            "bpm": r[2],
            "spo2": r[3],
            "temperatura": r[4]
        }
        for r in rows
    ]


@app.get("/datos/todos")
def obtener_todos():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mediciones ORDER BY fecha DESC")
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r[0],
            "fecha": r[1],
            "bpm": r[2],
            "spo2": r[3],
            "temperatura": r[4]
        }
        for r in rows
    ]


@app.get("/datos/hoy")
def obtener_hoy():
    hoy = date.today().isoformat()

    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM mediciones WHERE fecha LIKE ? ORDER BY fecha DESC",
        (hoy + "%",)
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r[0],
            "fecha": r[1],
            "bpm": r[2],
            "spo2": r[3],
            "temperatura": r[4]
        }
        for r in rows
    ]


@app.get("/datos/fecha/{fecha}")
def obtener_por_fecha(fecha: str):
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM mediciones WHERE fecha LIKE ? ORDER BY fecha DESC",
        (fecha + "%",)
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r[0],
            "fecha": r[1],
            "bpm": r[2],
            "spo2": r[3],
            "temperatura": r[4]
        }
        for r in rows
    ]


@app.post("/medicion/iniciar")
def iniciar_medicion():
    global medicion_activa
    medicion_activa = True
    return {"estado": "medicion iniciada"}


@app.post("/medicion/detener")
def detener_medicion():
    global medicion_activa
    medicion_activa = False
    return {"estado": "medicion detenida"}

@app.post("/iniciar")
def iniciar():
    global medicion_activa
    medicion_activa = True
    return {"estado": "Iniciada"}


@app.post("/detener")
def detener():
    global medicion_activa
    medicion_activa = False
    return {"estado": "medicion detenida"}



@app.get("/medicion/estado")
def estado_medicion():
    return {"activa": medicion_activa}


@app.get("/datos/ultimo")
def obtener_ultimo():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT fecha, bpm, spo2, temperatura
        FROM mediciones
        ORDER BY fecha DESC
        LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return {"mensaje": "Sin datos"}

    return {
        "fecha": row[0],
        "bpm": row[1],
        "spo2": row[2],
        "temperatura": row[3]
    }



@app.get("/pdf/fecha/{fecha}")
def generar_pdf_por_fecha(fecha: str):
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT fecha, bpm, spo2, temperatura
        FROM mediciones
        WHERE date(fecha) = ?
    """, (fecha,))
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return {"error": "No hay datos para esa fecha"}

    ruta_pdf = f"reporte_{fecha}.pdf"
    c = canvas.Canvas(ruta_pdf, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, f"Reporte de Signos Vitales - {fecha}")

    y = height - 100
    c.setFont("Helvetica", 10)

    for r in rows:
        c.drawString(
            50,
            y,
            f"{r[0]} | BPM: {r[1]} | SpO2: {r[2]}% | Temp: {r[3]}°C"
        )
        y -= 15
        if y < 50:
            c.showPage()
            y = height - 50

    c.save()

    return FileResponse(
        ruta_pdf,
        media_type="application/pdf",
        filename=ruta_pdf
    )

