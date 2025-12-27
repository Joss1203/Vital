const API = "http://192.168.0.32:8000";

export async function obtenerUltimo() {
  const res = await fetch(API + "/datos/ultimo");
  if (!res.ok) throw new Error("Error al obtener datos");
  return res.json();
}

export async function iniciarMedicion() {
  const res = await fetch(API + "/iniciar", { method: "POST" });
  return res.ok;
}

export async function detenerMedicion() {
  const res = await fetch(API + "/detener", { method: "POST" });
  return res.ok;
}

export function descargarPDF(fecha: string) {
  window.open(`${API}/reporte/${fecha}`, "_blank");
}
