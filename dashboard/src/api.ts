const API_URL = "https://vitalapp-aehhdfcwh6cvg3d6.centralus-01.azurewebsites.net";

export async function obtenerDatos() {
  const res = await fetch(`${API_URL}/datos/ultimo`);
  return res.json();
}

export async function iniciarMedicion() {
  await fetch(`${API_URL}/medicion/iniciar`, { method: "POST" });
}

export async function detenerMedicion() {
  await fetch(`${API_URL}/medicion/detener`, { method: "POST" });
}
