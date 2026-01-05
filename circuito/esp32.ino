#include <WiFi.h>
#include <Wire.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

#include <MAX30105.h>
#include <Adafruit_MLX90614.h>

// ================== WIFI ==================
const char* ssid = "iPhone de Jocelyn";
const char* password = "12032009";

// ================== MQTT CLOUD (HIVEMQ) ==================
const char* mqtt_server = "9992b180233e40c88409144595d4ad26.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "yoss_escom";
const char* mqtt_pass = "Yoss1234";
const char* mqtt_topic = "vital/datos";

// ================== OBJETOS MQTT ==================
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ================== SENSORES ==================
MAX30105 max30102;
Adafruit_MLX90614 mlx = Adafruit_MLX90614();

// ================== BPM ==================
float irDC = 0, irFiltered = 0, irPrevFiltered = 0;
unsigned long lastPeakTime = 0;
int bpm = 0;

#define ALPHA_DC 0.95
#define ALPHA_LP 0.45
#define BPM_AVG 5
int bpmBuffer[BPM_AVG];
byte bpmIndex = 0;

// ================== SpO2 ==================
#define SPO2_SAMPLES 50
uint32_t irBuffer[SPO2_SAMPLES];
uint32_t redBuffer[SPO2_SAMPLES];
byte spo2Index = 0;
float spo2 = 0;

// ================== OTRAS ==================
float temperature = 0;
unsigned long lastSend = 0;

// ================== MQTT RECONNECT ==================
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("🔄 Conectando MQTT...");
    if (client.connect("ESP32_VITAL", mqtt_user, mqtt_pass)) {
      Serial.println(" conectado ✅");
    } else {
      Serial.print(" fallo rc=");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  delay(2000);

  Wire.begin(21, 22);

  // ===== SENSORES =====
  if (!max30102.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("❌ MAX30102 no encontrado");
    while (1);
  }
  max30102.setup();
  max30102.setPulseAmplitudeIR(0x2F);
  max30102.setPulseAmplitudeRed(0x2F);

  if (!mlx.begin()) {
    Serial.println("❌ MLX90614 no encontrado");
    while (1);
  }

  // ===== WIFI =====
  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" conectado");

  // ===== MQTT =====
  espClient.setInsecure();                // 🔐 TLS sin CA
  client.setServer(mqtt_server, mqtt_port);
}

// ================== LOOP ==================
void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();

  uint32_t irValue = max30102.getIR();
  uint32_t redValue = max30102.getRed();

  // ===== VALIDAR DEDO =====
  if (irValue < 50000) {
    bpm = 0;
    spo2 = 0;
    delay(20);
    return;
  }

  // ===== BPM =====
  irDC = ALPHA_DC * irDC + (1 - ALPHA_DC) * irValue;
  float irAC = irValue - irDC;
  irFiltered = ALPHA_LP * irAC + (1 - ALPHA_LP) * irPrevFiltered;

  float threshold = max(200.0, abs(irFiltered) * 0.5);

  if (irPrevFiltered < threshold && irFiltered >= threshold) {
    unsigned long now = millis();
    unsigned long delta = now - lastPeakTime;

    if (delta > 400 && delta < 2000) {
      bpmBuffer[bpmIndex++] = 60000 / delta;
      if (bpmIndex >= BPM_AVG) bpmIndex = 0;

      int sum = 0;
      for (int i = 0; i < BPM_AVG; i++) sum += bpmBuffer[i];
      bpm = sum / BPM_AVG;
    }
    lastPeakTime = now;
  }
  irPrevFiltered = irFiltered;

  // ===== SpO2 =====
  irBuffer[spo2Index] = irValue;
  redBuffer[spo2Index] = redValue;
  spo2Index++;

  if (spo2Index >= SPO2_SAMPLES) {
    uint32_t irMin = irBuffer[0], irMax = irBuffer[0];
    uint32_t redMin = redBuffer[0], redMax = redBuffer[0];

    for (int i = 1; i < SPO2_SAMPLES; i++) {
      irMin = min(irMin, irBuffer[i]);
      irMax = max(irMax, irBuffer[i]);
      redMin = min(redMin, redBuffer[i]);
      redMax = max(redMax, redBuffer[i]);
    }

    float R = ((redMax - redMin) / (float)redMax) /
              ((irMax - irMin) / (float)irMax);

    spo2 = constrain(110 - 25 * R, 70, 100);
    spo2Index = 0;
  }

  // ===== TEMPERATURA =====
  temperature = mlx.readObjectTempC() + 0.5;

  // ===== PUBLICAR MQTT =====
  if (millis() - lastSend > 5000) {
    lastSend = millis();

    String payload = "{";
    payload += "\"bpm\":" + String(bpm) + ",";
    payload += "\"spo2\":" + String((int)spo2) + ",";
    payload += "\"temperatura\":" + String(temperature);
    payload += "}";

    client.publish(mqtt_topic, payload.c_str());
    Serial.println(payload);
  }

  delay(20);
}
