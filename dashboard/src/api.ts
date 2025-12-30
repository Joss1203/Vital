const API = "http://192.168.0.32:8000";

// =========================
// DATOS
// =========================
export async function obtenerUltimo() {
  const res = await fetch(`${API}/datos/ultimo`);
  if (!res.ok) throw new Error("Error al obtener datos");
  return res.json();
}

// =========================
// CONTROL DE MEDICIÓN (STUB)
// =========================
// MQTT controla esto ahora.
// Se dejan para no romper la UI.

export async function iniciarMedicion() {
  return true;
}

export async function detenerMedicion() {
  return true;
}

// =========================
// PDF (PENDIENTE)
// =========================
export function descargarPDF(fecha: string) {
  alert(`PDF del ${fecha} (pendiente de implementación)`);
}
