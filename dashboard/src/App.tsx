import { useEffect, useState } from "react";
import {
  obtenerDatos,
  iniciarMedicion,
  detenerMedicion,
} from "./api";

export default function App() {
  const [datos, setDatos] = useState<any>(null);
  const [estado, setEstado] = useState("Detenido");

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const d = await obtenerDatos();
        setDatos(d);
      } catch {
        console.log("Sin conexión");
      }
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container">
      <h1>🫀 Sistema de Signos Vitales</h1>

      <div className="monitor">
        <div className="valor">
          <span>SpO₂</span>
          <strong>{datos?.spo2 ?? "--"}%</strong>
        </div>

        <div className="valor">
          <span>Temperatura</span>
          <strong>{datos?.temperatura ?? "--"}°C</strong>
        </div>

        <div className="valor">
          <span>Pulso</span>
          <strong>{datos?.bpm ?? "--"} BPM</strong>
        </div>
      </div>

      <div className="ecg">
        <div className="line"></div>
      </div>

      <p className={`estado ${estado === "Activo" ? "on" : "off"}`}>
        Estado: {estado}
      </p>

      <div className="botones">
        <button
          onClick={async () => {
            await iniciarMedicion();
            setEstado("Activo");
          }}
        >
          ▶ Iniciar medición
        </button>

        <button
          onClick={async () => {
            await detenerMedicion();
            setEstado("Detenido");
          }}
        >
          ■ Detener medición
        </button>
      </div>
    </div>
  );
}
