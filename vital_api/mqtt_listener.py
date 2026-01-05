import paho.mqtt.client as mqtt
import json
from database import init_db, guardar_medicion

BROKER = "9992b180233e40c88409144595d4ad26.s1.eu.hivemq.cloud"
PORT = 8883
USER = "yoss_escom"
PASS = "Yoss1234"
TOPIC = "vital/datos"

init_db()

def on_connect(client, userdata, flags, rc):
    print("Conectado MQTT, rc =", rc)
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())
    print("Datos recibidos:", data)

    guardar_medicion(
        data["bpm"],
        data["spo2"],
        data["temperatura"]
    )

client = mqtt.Client()
client.username_pw_set(USER, PASS)
client.tls_set()
client.tls_insecure_set(True)

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)
client.loop_forever()
