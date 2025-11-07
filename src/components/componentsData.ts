// Example: public/assets/components/... path
export const componentsData = {
    microcontrollers: [
      {
        name: "Arduino",
        image: "/assets/components/microcontrollers/arduino.png",
        pins: [
          { name: "GND", x: 10, y: 90 },
          { name: "VCC", x: 10, y: 10 },
          { name: "D13", x: 90, y: 50 },
        ],
      },
      {
        name: "ESP32",
        image: "/assets/components/microcontrollers/esp32.png",
        pins: [
          { name: "GND", x: 10, y: 90 },
          { name: "3V3", x: 10, y: 10 },
          { name: "GPIO2", x: 90, y: 50 },
        ],
      },
    ],
    sensors: [
      {
        name: "DHT11",
        image: "/assets/components/sensors/dht11.png",
        pins: [
          { name: "VCC", x: 10, y: 10 },
          { name: "GND", x: 10, y: 90 },
          { name: "DATA", x: 50, y: 50 },
        ],
      },
      {
        name: "Ultrasonic",
        image: "/assets/components/sensors/ultrasonic.png",
        pins: [
          { name: "VCC", x: 10, y: 10 },
          { name: "GND", x: 10, y: 90 },
          { name: "TRIG", x: 30, y: 50 },
          { name: "ECHO", x: 70, y: 50 },
        ],
      },
    ],
    drivers: [
      {
        name: "L298N",
        image: "/assets/components/drivers/l298n.png",
        pins: [
          { name: "IN1", x: 10, y: 20 },
          { name: "IN2", x: 10, y: 50 },
          { name: "OUT1", x: 90, y: 20 },
        ],
      },
      {
        name: "Relay",
        image: "/assets/components/drivers/relay.png",
        pins: [
          { name: "VCC", x: 10, y: 10 },
          { name: "GND", x: 10, y: 90 },
          { name: "IN", x: 50, y: 50 },
        ],
      },
    ],
  };
  