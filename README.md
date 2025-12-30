# Sistema IoT de Monitoreo de Signos Vitales

# Arquitectura General
ESP32 (sensores)
   │
   │ MQTT sobre TLS
   ▼
☁️ HiveMQ Cloud
   │
   │ MQTT sobre TLS
   ▼
🍓 Raspberry Pi
   ├── mqtt_listener.py
   ├── SQLite (vital.db)
   └── FastAPI
           │
           ▼
🌐 React + Vite (Azure Static Web Apps)

# Sensores Utilizados

| Sensor       | Parámetro                        |
| ------------ | -------------------------------- |
| **MAX30102** | Frecuencia cardiaca (BPM) y SpO₂ |
| **MLX90614** | Temperatura corporal             |


# Componentes del Sistema

- SP32 (Cliente Publicador MQTT)
- Lee BPM, SpO₂ y temperatura
- Calcula parámetros fisiológicos
- Publica datos cada 5 segundos vía MQTT (TLS)
- No utiliza HTTP
- Funciona en cualquier red

# HiveMQ Cloud (Broker MQTT)

- Broker MQTT en la nube
- Comunicación segura mediante TLS (puerto 8883)
- Permite desacoplar sensores y backend

# Raspberry Pi (Backend)
Funciones:
- Suscripción MQTT (mqtt_listener.py)
- Almacenamiento en SQLite
- Exposición de datos mediante FastAPI
- Generación de reportes PDF

| Método | Endpoint           | Descripción           |
| ------ | ------------------ | --------------------- |
| GET    | `/`                | Estado del API        |
| GET    | `/datos`           | Historial completo    |
| GET    | `/datos/ultimo`    | Última medición       |
| GET    | `/datos/hoy`       | Mediciones del día    |
| GET    | `/reporte/{fecha}` | Reporte PDF por fecha |


# Frontend Web (React + Vite)
- Dashboard clínico
- Visualización en tiempo real (polling)
- Evaluación clínica automática
- Alertas por valores fuera de rango
- Descarga de reportes PDF
- Preparado para despliegue en Azure Static Web Apps

# Evaluación Clínica

El sistema clasifica los valores en:
- NORMAL
- ADVERTENCIA
- ALERTA

Ejemplos:
- Hipoxemia (SpO₂ < 90%)
- Bradicardia / Taquicardia
- Hipotermia / Fiebre

# Reportes PDF
- Generados dinámicamente desde FastAPI
- Basados en datos almacenados en SQLite
- Descargables desde la interfaz web
- Formato clínico legible

# Cómo Ejecutar el Proyecto
1.  ESP32

Cargar el sketch MQTT

Configurar WiFi y credenciales HiveMQ

2. Raspberry Pi
        pip install paho-mqtt fastapi uvicorn reportlab
        python3 mqtt_listener.py
        uvicorn main:app --host 0.0.0.0 --port 8000

3. Frontend
        npm install
        npm run dev

# Tecnologías Utilizadas
- ESP32 (Arduino)
- MQTT / HiveMQ Cloud
- Python
- FastAPI
- SQLite
- React + Vite
- Chart.js
- ReportLab
- Azure Static Web Apps

# Para editar Frontend
├── vital/
├── esp32/
│   └── esp32_mqtt.ino
│
├── dashboard/
│   ├── public
    │ 
    │   ├── App.tsx 
    │   └── api.ts
    │   └── main.tsx

git clone https://github.com/Joss1203/Vital.git

cd dashboard

npm run dev

editar App.tsx

# backend
vital-iot/
├── esp32/
│   └── esp32_mqtt.ino
│
├── backend/
│   ├── main.py
│   ├── mqtt_listener.py
│   ├── database.py
│   └── vital.db

desde rasperry cd /home/jocelyn/Desktop/vital/vital_api
 - python3 mqtt_listener.py

en otra terminar cd /home/jocelyn/Desktop/vital/vital_api
- source venv/bin/activate
    - uvicorn main_app --host 0.0.0.0 --port 8000