import { useEffect, useState } from "react";
import {
  obtenerUltimo,
  iniciarMedicion,
  detenerMedicion,
  descargarPDF,
} from "./api";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  type ChartOptions,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

type Dato = {
  fecha: string;
  bpm: number;
  spo2: number;
  temperatura: number;
};

export default function App() {
  const [datos, setDatos] = useState<Dato | null>(null);
  const [historial, setHistorial] = useState<Dato[]>([]);
  const [activo, setActivo] = useState(false);
  const [fechaPDF, setFechaPDF] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const d = await obtenerUltimo();
        if (d && d.bpm !== undefined) {
          setDatos(d);
          setHistorial((prev) => [...prev, d].slice(-30));
        }
      } catch {
        console.log("Sin conexión al backend");
      }
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const chartData = {
    labels: historial.map((_, i) => i.toString()),
    datasets: [
      {
        label: "BPM",
        data: historial.map((d) => d.bpm),
        borderColor: "red",
        tension: 0.3,
      },
      {
        label: "SpO₂",
        data: historial.map((d) => d.spo2),
        borderColor: "green",
        tension: 0.3,
      },
      {
        label: "Temp °C",
        data: historial.map((d) => d.temperatura),
        borderColor: "cyan",
        tension: 0.3,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "black" },
      },
    },
  };

  return (
    <div style={{ background: "#0e1621", minHeight: "100vh", color: "white", padding: 20 }}>
      <h1>Monitor de Signos Vitales</h1>

      <div style={{ display: "flex", gap: 20 }}>
        <div>
          <h3>BPM</h3>
          <p>{datos?.bpm ?? "--"}</p>
        </div>
        <div>
          <h3>SpO₂</h3>
          <p>{datos?.spo2 ?? "--"}%</p>
        </div>
        <div>
          <h3>Temp</h3>
          <p>{datos?.temperatura ?? "--"} °C</p>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={async () => { await iniciarMedicion(); setActivo(true); }}>
          Iniciar medición
        </button>

        <button style={{ marginLeft: 10 }} onClick={async () => { await detenerMedicion(); setActivo(false); }}>
          Detener medición
        </button>
      </div>

      <p style={{ color: activo ? "lime" : "red" }}>
        Estado: {activo ? "Activo" : "Detenido"}
      </p>

      <div style={{ background: "white", padding: 10 }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div style={{ marginTop: 20 }}>
        <input type="date" value={fechaPDF} onChange={(e) => setFechaPDF(e.target.value)} />
        <button onClick={() => descargarPDF(fechaPDF)}>Descargar PDF</button>
      </div>
    </div>
  );
}
