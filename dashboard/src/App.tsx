import { useEffect, useState } from "react";
import {
  obtenerUltimo,
  iniciarMedicion,
  detenerMedicion,
  descargarPDF,
} from "./api";

import "chart.js/auto";

/* =========================
   TIPOS
========================= */
type Dato = {
  fecha: string;
  bpm: number;
  spo2: number;
  temperatura: number;
};

const API_URL = "http://192.168.0.32:8000";


/* =========================
   FUNCIONES CLÍNICAS
========================= */
function evaluarBPM(bpm?: number) {
  if (!bpm) return null;
  if (bpm < 50) return { nivel: "ALERTA", texto: "Bradicardia detectada", color: "#dc2626" };
  if (bpm < 60) return { nivel: "ADVERTENCIA", texto: "Frecuencia cardiaca baja", color: "#f59e0b" };
  if (bpm <= 100) return { nivel: "NORMAL", texto: "Frecuencia cardiaca normal", color: "#16a34a" };
  if (bpm <= 120) return { nivel: "ADVERTENCIA", texto: "Taquicardia leve", color: "#f59e0b" };
  return { nivel: "ALERTA", texto: "Taquicardia severa", color: "#dc2626" };
}

function evaluarSpO2(spo2?: number) {
  if (!spo2) return null;
  if (spo2 < 90) return { nivel: "ALERTA", texto: "Hipoxemia", color: "#dc2626" };
  if (spo2 < 95) return { nivel: "ADVERTENCIA", texto: "Saturación baja", color: "#f59e0b" };
  return { nivel: "NORMAL", texto: "Saturación normal", color: "#16a34a" };
}

function evaluarTemp(temp?: number) {
  if (!temp) return null;
  if (temp < 34) return { nivel: "ALERTA", texto: "Hipotermia", color: "#dc2626" };
  if (temp <= 37.5) return { nivel: "NORMAL", texto: "Temperatura normal", color: "#16a34a" };
  if (temp <= 38) return { nivel: "ADVERTENCIA", texto: "Fiebre", color: "#f59e0b" };
  return { nivel: "ALERTA", texto: "Fiebre", color: "#2626dcff" };
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function App() {
  const [datos, setDatos] = useState<Dato | null>(null);
  const [historial, setHistorial] = useState<Dato[]>([]);
  const [activo, setActivo] = useState(false);
  const [fechaPDF, setFechaPDF] = useState(
    new Date().toISOString().slice(0, 10)
  );

  /* =========================
     LECTURA DE DATOS
  ========================= */
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const d = await obtenerUltimo();
        if (d) {
          setDatos(d);
          setHistorial((prev) => [...prev, d].slice(-30));
        }
      } catch {
        console.log("Backend no disponible");
      }
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  /* =========================
     ALERTAS
  ========================= */
  const alertaBPM = evaluarBPM(datos?.bpm);
  const alertaSpO2 = evaluarSpO2(datos?.spo2);
  const alertaTemp = evaluarTemp(datos?.temperatura);

  const alertas = [alertaBPM, alertaSpO2, alertaTemp].filter(
    (a) => a && a.nivel !== "NORMAL"
  );

  return (
    <div
      style={{
        background: "#0e1621",
        minHeight: "100vh",
        color: "white",
        padding: 30,
        lineHeight: 1.6, // 👈 INTERLINEADO
      }}
    >


  {/* IMAGEN */}
  <div style={{ flex: 1, textAlign: "right" }}>
    <img
      src="/monitor-clinico.jpg"
      alt="Monitor de signos vitales"
      style={{
        maxWidth: "100%",
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    />
  </div>

  {/* =========================
          VALORES
      ========================= */}
      <div
  style={{
    display: "flex",
    gap: 20,
    marginTop: 40,
    justifyContent: "center", 
    alignItems: "center",     
  }}
>

        <div style={{ background: "#1e293b", padding: 20, borderRadius: 10 }}>
          <h3>❤️ BPM</h3>
          <h2>{datos?.bpm ?? "--"}</h2>
          
        </div>

        <div style={{ background: "#1e293b", padding: 20, borderRadius: 10 }}>
          <h3>🫁 SpO₂</h3>
          <h2>{datos?.spo2 ?? "--"}%</h2>
        </div>

        <div style={{ background: "#1e293b", padding: 20, borderRadius: 10 }}>
          <h3>🌡 Temperatura</h3>
          <h2>{datos?.temperatura ?? "--"} °C</h2>
        </div>
      </div>

      {/* =========================
          BOTONES
      ========================= */}
      <div style={{ marginTop: 30,
        textAlign: "center",
        justifyContent: "center",
       }}>
        <button
          onClick={async () => {
            await iniciarMedicion();
            setActivo(true);
          }}
        >
          Iniciar medición
        </button>

        <button
          style={{ marginLeft: 10 }}
          onClick={async () => {
            await detenerMedicion();
            setActivo(false);
          }}
        >
          Detener medición
        </button>

        <p style={{ marginTop: 10, color: activo ? "lime" : "red" }}>
          Estado: {activo ? "Activo" : "Detenido"}
        </p>
      </div>

      {/* =========================
          ALERTAS CLÍNICAS
      ========================= */}
      {alertas.length > 0 && (
        <div
          style={{
            marginTop: 30,
            background: "#1e293b",
            padding: 20,
            borderRadius: 12,
            borderLeft: "6px solid #dc2626",
          }}
        >
          <h3>🚨 Alertas clínicas activas</h3>

          {alertas.map((a, i) => (
            <p key={i} style={{ color: a.color }}>
              <b>{a.nivel}:</b> {a.texto}
            </p>
          ))}
        </div>
      )}

      {/* =========================
          INTERPRETACIÓN CLÍNICA
      ========================= */}
      <div
        style={{
          marginTop: 30,
          background: "#0f1c2e",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h3> Interpretación clínica</h3>

        <p>
          Los valores mostrados corresponden a una evaluación fisiológica en
          tiempo real. Las alertas indican parámetros fuera de los rangos
          normales para un adulto.
        </p>

        <p>
          Este sistema es una herramienta de apoyo y no sustituye la valoración
          médica profesional.
        </p>
      </div>

      {/* =========================
          CONTACTO MÉDICO
      ========================= */}
      <div
        style={{
          marginTop: 30,
          background: "#1e293b",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h3> Contacto y referencia médica</h3>

        <ul>
          <li>
            <a
              href="https://www.gob.mx/imss"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#60a5fa" }}
            >
              Instituto Mexicano del Seguro Social (IMSS)
            </a>
          </li>
          <li>
            <a
              href="https://cruzrojamexicana.org.mx/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#60a5fa" }}
            >
              Cruz Roja Mexicana
            </a>
          </li>
          <li>
            <a
              href="https://www.gob.mx/salud"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#60a5fa" }}
            >
              Secretaría de Salud
            </a>
          </li>
        </ul>

        <p style={{ fontSize: 14 }}>
          En caso de emergencia, acudir a la unidad médica más cercana.
        </p>
      </div>

      {/* =========================
          PDF
      ========================= */}
      <div style={{ marginTop: 30 }}>
        <input
          type="date"
          value={fechaPDF}
          onChange={(e) => setFechaPDF(e.target.value)}
        />
        <button
          style={{ marginLeft: 10 }}
          onClick={() => descargarPDF(fechaPDF)}
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
}
