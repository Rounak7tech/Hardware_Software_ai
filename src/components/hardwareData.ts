export const hardwareData = {
  microcontrollers: [
    {
      id: "arduino-uno",
      name: "Arduino Uno",
      image: "https://via.placeholder.com/200?text=Arduino+Uno",
      pins: ["RESET","3.3V","5V","GND","A0","A1","A2","A3","A4","A5","D0","D1","D2","D3","D4","D5","D6","D7","D8","D9","D10","D11","D12","D13"],
      compatible: ["hc-sr04","l298n","dht11"]
    },
    {
      id: "esp32-devkit",
      name: "ESP32 DevKit",
      image: "https://via.placeholder.com/200?text=ESP32",
      pins: ["3V3","GND","GPIO0","GPIO2","GPIO4","GPIO5","GPIO12","GPIO13","GPIO14","GPIO15","GPIO16","GPIO17","VIN"],
      compatible: ["bme280","ssd1306","dht11","vl53l0x"]
    }
  ],
  sensors: [
    {
      id: "dht11",
      name: "DHT11 Temp/Humidity",
      image: "https://via.placeholder.com/200?text=DHT11",
      pins: ["VCC","DATA","GND"],
      compatible: ["arduino-uno","esp32-devkit"]
    },
    {
      id: "hc-sr04",
      name: "HC-SR04 Ultrasonic",
      image: "https://via.placeholder.com/200?text=HC-SR04",
      pins: ["VCC","Trig","Echo","GND"],
      compatible: ["arduino-uno","esp32-devkit"]
    }
  ]
};
