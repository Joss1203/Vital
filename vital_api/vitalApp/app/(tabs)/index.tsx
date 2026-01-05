import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView, Alert } from "react-native";

const RASPBERRY_URL = "http://192.168.0.32:8000"; 
export default function VitalScreen() {
  const [activa, setActiva] = useState(false);
  const [datos, setDatos] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const safeFetch = async (url: string, options?: any) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  };

  const obtenerEstado = async () => {
    const json = await safeFetch(`${RASPBERRY_URL}/medicion/estado`);
    if (json && typeof json.activa === "boolean") {
      setActiva(json.activa);
    }
  };

  const iniciar = async () => {
    await safeFetch(`${RASPBERRY_URL}/medicion/iniciar`, { method: "POST" });
    Alert.alert("Medición iniciada");
    obtenerEstado();
  };

  const detener = async () => {
    await safeFetch(`${RASPBERRY_URL}/medicion/detener`, { method: "POST" });
    Alert.alert("Medición detenida");
    obtenerEstado();
  };

  const obtenerDatos = async () => {
    const json = await safeFetch(`${RASPBERRY_URL}/datos/hoy`);
    if (Array.isArray(json) && json.length > 0) {
      setDatos(json[0]);
    }
  };

  useEffect(() => {
    obtenerEstado();
    const interval = setInterval(obtenerDatos, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>🫀 Sistema de Signos Vitales</Text>

      {error && <Text style={styles.error}>⚠ {error}</Text>}

      <View style={styles.botones}>
        <Button title="▶ Iniciar medición" onPress={iniciar} />
        <Button title="⏹ Detener medición" onPress={detener} />
      </View>

      <Text style={styles.estado}>
        Estado: {activa ? "🟢 Midiendo" : "🔴 Detenido"}
      </Text>

      {datos && (
        <View style={styles.card}>
          <Text>BPM: {datos.bpm}</Text>
          <Text>SpO₂: {datos.spo2} %</Text>
          <Text>Temperatura: {datos.temperatura} °C</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  botones: { width: "100%", gap: 10, marginBottom: 20 },
  estado: { fontSize: 16, marginBottom: 10 },
  card: { padding: 15, borderWidth: 1, borderRadius: 10, width: "100%" },
  error: { color: "red", marginBottom: 10 },
});
