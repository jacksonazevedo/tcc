#include <DHT.h>
#include <PubSubClient.h>
#include <ArduinoHttpClient.h>
#include <ESP8266WiFi.h>

#define DHTPIN D3 // pino que estamos conectado
#define DHTTYPE DHT11 // DHT 11
int Gas_analog = A0;    // used for ESP32
int Gas_digital = D1;   // used for ESP32
DHT dht(DHTPIN, DHTTYPE);
char* ssid = "jack";
char* password = "silva12345";
WiFiClient espClient;
PubSubClient client(espClient);
char ipHTTP[] = "192.168.0.33";  // server address
int port = 446;
HttpClient clienthttp = HttpClient(espClient, ipHTTP, port);
const char* mqtt_server = "io.adafruit.com";

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  dht.begin();
  pinMode(Gas_digital, INPUT);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client", "jacksonnazevedo", "aio_JQoF73Ejlti3CFy9UJM5Z2rJzOkK")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop() {
  float umidade = dht.readHumidity();
  float temperatura = dht.readTemperature();
  int gassensorAnalog = analogRead(Gas_analog);
  int gassensorDigital = digitalRead(Gas_digital);
  Serial.print("Gas Sensor: ");
  Serial.print(gassensorAnalog);
  Serial.print("\t");
  Serial.print("Gas Class: ");
  Serial.print(gassensorDigital);
  Serial.print("\t");
  Serial.print("\t");
  if (gassensorDigital == 0) {
    Serial.println("Gas detectado");
  }
  else {
    Serial.println("No Gas");
  }
  if (isnan(temperatura) || isnan(umidade))
  {
    Serial.println("Failed to read from DHT");
  }
  else
  {
    Serial.print("Umidade: ");
    Serial.print(umidade);
    Serial.println("º%");
    Serial.print("Temperatura: ");
    Serial.print(temperatura);
    Serial.println(" *C");
    Serial.print("\n");
  }
  char tempStringTemperatura[8];
  char tempStringUmidade[8];
  dtostrf(temperatura, 1, 2, tempStringTemperatura);
  dtostrf(umidade, 1, 2, tempStringUmidade);
  if (!client.connected()) {
    reconnect();
  }
  client.publish("jacksonnazevedo/feeds/lab-temperatura", tempStringTemperatura);
  if (temperatura > 30) {

    enviarAlerta((String)temperatura, "1" );
  }
  delay(3000);
  if (!client.connected()) {
    reconnect();
  }
  client.publish("jacksonnazevedo/feeds/lab-umidade", tempStringUmidade);
  delay(3000);
  if (!client.connected()) {
    reconnect();
  }
  if (gassensorDigital == 0) {
    client.publish("jacksonnazevedo/feeds/lab-gas", "true");
    enviarAlerta((String)gassensorAnalog, "2");

  } else {
    client.publish("jacksonnazevedo/feeds/lab-gas", "false");
  }
  delay(3000);
}

void enviarAlerta(String value, String tipo) {
  Serial.println("making GET request");
  Serial.print("Mensagem a ser enviada: ");
  Serial.print(tipo);
  Serial.println(value);
  String url = "/tcc/alerta/email/email.php?value=" + value + "&tipo=" + tipo;
  Serial.print("url");
  Serial.println(url);
  clienthttp.get(url);
  int statusCode = clienthttp.responseStatusCode();
  String response = clienthttp.responseBody();
  Serial.print("Status code: ");
  Serial.println(statusCode);
  Serial.print("Response: ");
  Serial.println(response);
  Serial.println("Wait five seconds");
  delay(5000);
}
