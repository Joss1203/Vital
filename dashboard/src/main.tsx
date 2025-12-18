import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento root");
}

ReactDOM.createRoot(rootElement).render(
  <App />
);
import type { ChartOptions } from "chart.js";

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      labels: { color: "black" },
    },
  },
};
