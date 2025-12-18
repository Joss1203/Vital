import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function VitalChart({ datos }: any) {
  return (
    <Line
      data={{
        labels: datos.map((d: any) => d.fecha.slice(11, 19)),
        datasets: [
          {
            label: "BPM",
            data: datos.map((d: any) => d.bpm),
            borderColor: "red",
          },
          {
            label: "SpO₂",
            data: datos.map((d: any) => d.spo2),
            borderColor: "blue",
          },
          {
            label: "Temperatura (°C)",
            data: datos.map((d: any) => d.temperatura),
            borderColor: "green",
          },
        ],
      }}
    />
  );
}
