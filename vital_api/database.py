import sqlite3

DB = "vital.db"

def init_db():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mediciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT,
        bpm INTEGER,
        spo2 INTEGER,
        temperatura REAL
    )
    """)

    conn.commit()
    conn.close()

def guardar_medicion(bpm, spo2, temperatura):
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO mediciones (fecha, bpm, spo2, temperatura) VALUES (datetime('now'), ?, ?, ?)",
        (bpm, spo2, temperatura)
    )

    conn.commit()
    conn.close()
