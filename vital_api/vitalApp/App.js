import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, ScrollView } from 'react-native';

const RASPBERRY_IP = "http://192.168.0.32:8000"; // 👈 CAMBIA ESTA IP

export default function App() {
  const [estado, setEstado] = useState(false);
  const [datos, setDatos] = useState(null);

  const obtenerEstado = async () => {
    const res = await fetch(`${RASPBERRY_IP}/medicion/estado`);
    const json = await res.json();
    setEstado(json.activa);
  };

  const iniciar = async () => {
    await fetch(`${RASPBERRY_IP}/medicion/iniciar`, { method: "POST" });
    Alert.alert("Medición iniciada");
    obtenerEstado();
  };

  const detener = async () => {
    await fetch(`${RASPBERRY_IP}/medicion/detener`, { method: "POST" });
    Alert.alert("Medición detenida");
    obtenerEstado();
  };

  const obtenerDatosHoy = async () => {
    const res = await fetch(`${RASPBERRY_IP}/datos/hoy`);
    const json = await res.json();
    if (json.length > 0) {
      setDatos(json[0]);
    }
  };

  useEffect(() => {
    obtenerEstado();
    const intervalo = setInterval(obtenerDatosHoy, 3000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>🫀 Sistema de Signos Vitales</Text>

      <Text style={styles.instrucciones}>
        Coloca tu dedo en el sensor y presiona "Iniciar medición".
      </Text>

      <View style={styles.botones}>
        <Button title="▶ Iniciar medición" onPress={iniciar} />
        <Button title="⏹ Detener medición" onPress={detener} />
      </View>

      <Text style={styles.estado}>
        Estado: {estado ? "🟢 Midiendo" : "🔴 Detenido"}
      </Text>

      {datos && (
        <View style={styles.card}>
          <Text>BPM: {datos.bpm}</Text>
          <Text>SpO₂: {datos.spo2} %</Text>
          <Text>Temperatura: {datos.temperatura} °C</Text>
        </View>
      )}

      <Button
        title="📄 Descargar PDF de hoy"
        onPress={() =>
          Alert.alert(
            "PDF",
            `Descarga en: ${RASPBERRY_IP}/pdf/fecha/${new Date().toISOString().slice(0,10)}`
          )
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  instrucciones: {
    textAlign: 'center',
    marginBottom: 20
  },
  botones: {
    width: '100%',
    gap: 10,
    marginBottom: 20
  },
  estado: {
    fontSize: 16,
    marginBottom: 10
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%'
  }
});
