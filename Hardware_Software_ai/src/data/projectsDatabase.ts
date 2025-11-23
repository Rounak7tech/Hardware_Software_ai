export interface Component {
    id: string;
    name: string;
    type: 'microcontroller' | 'driver' | 'sensor' | 'other';
    image: string;
    pins: Record<string, string>;
    description: string;
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    components: string[];
    connections: Connection[];
    code: string;
    instructions: string[];
    images: {
      wiring: string;
      components: string[];
    };
  }
  
  export interface Connection {
    from: {
      component: string;
      pin: string;
    };
    to: {
      component: string;
      pin: string;
    };
    wire: string;
    description: string;
  }
  
  export const componentsDatabase: Component[] = [
    // Microcontrollers
    {
      id: 'arduino-uno-r3',
      name: 'Arduino Uno R3',
      type: 'microcontroller',
      image: '/images/components/arduino-uno.jpg',
      pins: {
        '3.3V': 'Power output',
        '5V': 'Power output',
        'GND': 'Ground',
        'A0': 'Analog input',
        'A1': 'Analog input',
        'A2': 'Analog input',
        'A3': 'Analog input',
        'A4': 'Analog input (I2C SDA)',
        'A5': 'Analog input (I2C SCL)',
        'D2': 'Digital I/O (Interrupt)',
        'D3': 'Digital I/O (PWM)',
        'D4': 'Digital I/O',
        'D5': 'Digital I/O (PWM)',
        'D6': 'Digital I/O (PWM)',
        'D7': 'Digital I/O',
        'D8': 'Digital I/O',
        'D9': 'Digital I/O (PWM)',
        'D10': 'Digital I/O (PWM, SPI SS)',
        'D11': 'Digital I/O (PWM, SPI MOSI)',
        'D12': 'Digital I/O (SPI MISO)',
        'D13': 'Digital I/O (SPI SCK, LED)',
      },
      description: 'ATmega328P based microcontroller board'
    },
    {
      id: 'esp32-devkit',
      name: 'ESP32 DevKit V1',
      type: 'microcontroller',
      image: '/images/components/esp32.jpg',
      pins: {
        '3.3V': 'Power output',
        '5V': 'Power output',
        'GND': 'Ground',
        'GPIO0': 'Digital I/O (Boot mode)',
        'GPIO2': 'Digital I/O',
        'GPIO4': 'Digital I/O',
        'GPIO5': 'Digital I/O',
        'GPIO12': 'Digital I/O',
        'GPIO13': 'Digital I/O',
        'GPIO14': 'Digital I/O',
        'GPIO15': 'Digital I/O',
        'GPIO16': 'Digital I/O',
        'GPIO17': 'Digital I/O',
        'GPIO18': 'Digital I/O (SPI SCK)',
        'GPIO19': 'Digital I/O (SPI MISO)',
        'GPIO21': 'Digital I/O (I2C SDA)',
        'GPIO22': 'Digital I/O (I2C SCL)',
        'GPIO23': 'Digital I/O (SPI MOSI)',
      },
      description: 'Wi-Fi & Bluetooth dual-core microcontroller'
    },
    
    // Drivers
    {
      id: 'l298n',
      name: 'L298N Motor Driver',
      type: 'driver',
      image: '/images/components/l298n.jpg',
      pins: {
        'VCC': 'Power input (5V-35V)',
        'GND': 'Ground',
        '5V': '5V output',
        'IN1': 'Motor 1 direction control',
        'IN2': 'Motor 1 direction control',
        'IN3': 'Motor 2 direction control',
        'IN4': 'Motor 2 direction control',
        'ENA': 'Motor 1 speed control (PWM)',
        'ENB': 'Motor 2 speed control (PWM)',
        'OUT1': 'Motor 1 output +',
        'OUT2': 'Motor 1 output -',
        'OUT3': 'Motor 2 output +',
        'OUT4': 'Motor 2 output -',
      },
      description: 'Dual H-Bridge motor driver for DC motors'
    },
    {
      id: 'ssd1306',
      name: 'SSD1306 OLED Display',
      type: 'driver',
      image: '/images/components/ssd1306.jpg',
      pins: {
        'VCC': 'Power input (3.3V-5V)',
        'GND': 'Ground',
        'SCL': 'I2C Clock',
        'SDA': 'I2C Data',
      },
      description: '128x64 OLED display with I2C interface'
    },
    
    // Sensors
    {
      id: 'dht22',
      name: 'DHT22 Temperature & Humidity',
      type: 'sensor',
      image: '/images/components/dht22.jpg',
      pins: {
        'VCC': 'Power input (3.3V-6V)',
        'GND': 'Ground',
        'DATA': 'Data signal',
      },
      description: 'Digital temperature and humidity sensor'
    },
    {
      id: 'hc-sr04',
      name: 'HC-SR04 Ultrasonic Sensor',
      type: 'sensor',
      image: '/images/components/hc-sr04.jpg',
      pins: {
        'VCC': 'Power input (5V)',
        'GND': 'Ground',
        'TRIG': 'Trigger input',
        'ECHO': 'Echo output',
      },
      description: 'Ultrasonic distance measurement sensor'
    },
    {
      id: 'pir-hc-sr501',
      name: 'PIR Motion Sensor',
      type: 'sensor',
      image: '/images/components/pir.jpg',
      pins: {
        'VCC': 'Power input (5V-12V)',
        'GND': 'Ground',
        'OUT': 'Digital output',
      },
      description: 'Passive infrared motion detection sensor'
    },
  ];
  
  export const projectsDatabase: Project[] = [
    {
      id: 'weather-station',
      name: 'IoT Weather Station',
      description: 'Monitor temperature, humidity and display data on OLED screen with Wi-Fi connectivity',
      difficulty: 'intermediate',
      estimatedTime: '2-3 hours',
      components: ['esp32-devkit', 'dht22', 'ssd1306'],
      connections: [
        {
          from: { component: 'esp32-devkit', pin: '3.3V' },
          to: { component: 'dht22', pin: 'VCC' },
          wire: 'Red wire',
          description: 'Power supply for DHT22 sensor'
        },
        {
          from: { component: 'esp32-devkit', pin: 'GND' },
          to: { component: 'dht22', pin: 'GND' },
          wire: 'Black wire',
          description: 'Ground connection'
        },
        {
          from: { component: 'esp32-devkit', pin: 'GPIO4' },
          to: { component: 'dht22', pin: 'DATA' },
          wire: 'Yellow wire',
          description: 'Data signal connection'
        },
        {
          from: { component: 'esp32-devkit', pin: '3.3V' },
          to: { component: 'ssd1306', pin: 'VCC' },
          wire: 'Red wire',
          description: 'Power supply for OLED display'
        },
        {
          from: { component: 'esp32-devkit', pin: 'GND' },
          to: { component: 'ssd1306', pin: 'GND' },
          wire: 'Black wire',
          description: 'Ground connection'
        },
        {
          from: { component: 'esp32-devkit', pin: 'GPIO21' },
          to: { component: 'ssd1306', pin: 'SDA' },
          wire: 'Blue wire',
          description: 'I2C Data line'
        },
        {
          from: { component: 'esp32-devkit', pin: 'GPIO22' },
          to: { component: 'ssd1306', pin: 'SCL' },
          wire: 'Green wire',
          description: 'I2C Clock line'
        }
      ],
      code: `#include <WiFi.h>
  #include <DHT.h>
  #include <Wire.h>
  #include <Adafruit_GFX.h>
  #include <Adafruit_SSD1306.h>
  
  #define DHT_PIN 4
  #define DHT_TYPE DHT22
  #define OLED_RESET -1
  #define SCREEN_WIDTH 128
  #define SCREEN_HEIGHT 64
  
  DHT dht(DHT_PIN, DHT_TYPE);
  Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
  
  const char* ssid = "YOUR_WIFI_SSID";
  const char* password = "YOUR_WIFI_PASSWORD";
  
  void setup() {
    Serial.begin(115200);
    
    // Initialize DHT sensor
    dht.begin();
    
    // Initialize OLED display
    if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
      Serial.println(F("SSD1306 allocation failed"));
      for(;;);
    }
    
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,0);
    display.println("Connecting to WiFi...");
    display.display();
    
    // Connect to WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.println("Connecting to WiFi...");
    }
    
    Serial.println("WiFi connected!");
    Serial.println(WiFi.localIP());
    
    display.clearDisplay();
    display.setCursor(0,0);
    display.println("WiFi Connected!");
    display.println(WiFi.localIP());
    display.display();
    delay(2000);
  }
  
  void loop() {
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
    
    // Display on OLED
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    
    display.setCursor(0,0);
    display.println("Weather Station");
    display.println("---------------");
    display.print("Temp: ");
    display.print(temperature);
    display.println(" *C");
    display.print("Humidity: ");
    display.print(humidity);
    display.println(" %");
    display.println("---------------");
    display.print("IP: ");
    display.println(WiFi.localIP());
    
    display.display();
    
    // Print to serial
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print(" *C, Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
    
    delay(2000);
  }`,
      instructions: [
        'Connect the DHT22 sensor to ESP32: VCC to 3.3V, GND to GND, DATA to GPIO4',
        'Connect the SSD1306 OLED display: VCC to 3.3V, GND to GND, SDA to GPIO21, SCL to GPIO22',
        'Upload the code to ESP32 using Arduino IDE',
        'Configure your WiFi credentials in the code',
        'Power on the system and check the OLED display for readings',
        'Access the serial monitor to see detailed sensor data'
      ],
      images: {
        wiring: '/images/projects/weather-station-wiring.jpg',
        components: ['/images/components/esp32.jpg', '/images/components/dht22.jpg', '/images/components/ssd1306.jpg']
      }
    },
    {
      id: 'distance-monitor',
      name: 'Ultrasonic Distance Monitor',
      description: 'Measure distance using ultrasonic sensor and display on OLED with alerts',
      difficulty: 'beginner',
      estimatedTime: '1-2 hours',
      components: ['arduino-uno-r3', 'hc-sr04', 'ssd1306'],
      connections: [
        {
          from: { component: 'arduino-uno-r3', pin: '5V' },
          to: { component: 'hc-sr04', pin: 'VCC' },
          wire: 'Red wire',
          description: 'Power supply for ultrasonic sensor'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'GND' },
          to: { component: 'hc-sr04', pin: 'GND' },
          wire: 'Black wire',
          description: 'Ground connection'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'D9' },
          to: { component: 'hc-sr04', pin: 'TRIG' },
          wire: 'Yellow wire',
          description: 'Trigger signal'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'D10' },
          to: { component: 'hc-sr04', pin: 'ECHO' },
          wire: 'Orange wire',
          description: 'Echo signal'
        },
        {
          from: { component: 'arduino-uno-r3', pin: '5V' },
          to: { component: 'ssd1306', pin: 'VCC' },
          wire: 'Red wire',
          description: 'Power supply for OLED display'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'GND' },
          to: { component: 'ssd1306', pin: 'GND' },
          wire: 'Black wire',
          description: 'Ground connection'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'A4' },
          to: { component: 'ssd1306', pin: 'SDA' },
          wire: 'Blue wire',
          description: 'I2C Data line'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'A5' },
          to: { component: 'ssd1306', pin: 'SCL' },
          wire: 'Green wire',
          description: 'I2C Clock line'
        }
      ],
      code: `#include <Wire.h>
  #include <Adafruit_GFX.h>
  #include <Adafruit_SSD1306.h>
  
  #define TRIG_PIN 9
  #define ECHO_PIN 10
  #define OLED_RESET -1
  #define SCREEN_WIDTH 128
  #define SCREEN_HEIGHT 64
  
  Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
  
  void setup() {
    Serial.begin(115200);
    
    // Initialize ultrasonic sensor pins
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    
    // Initialize OLED display
    if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
      Serial.println(F("SSD1306 allocation failed"));
      for(;;);
    }
    
    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,0);
    display.println("Distance");
    display.println("Monitor");
    display.display();
    delay(2000);
  }
  
  void loop() {
    // Trigger ultrasonic sensor
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    // Read echo time
    long duration = pulseIn(ECHO_PIN, HIGH);
    
    // Calculate distance
    float distance = duration * 0.034 / 2;
    
    // Display on OLED
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    
    display.setCursor(0,0);
    display.println("Distance Monitor");
    display.println("---------------");
    display.setTextSize(2);
    display.print(distance);
    display.println(" cm");
    display.setTextSize(1);
    display.println("---------------");
    
    if (distance < 10) {
      display.setTextColor(SSD1306_WHITE);
      display.println("ALERT: TOO CLOSE!");
    } else if (distance < 30) {
      display.setTextColor(SSD1306_WHITE);
      display.println("Warning Zone");
    } else {
      display.setTextColor(SSD1306_WHITE);
      display.println("Safe Distance");
    }
    
    display.display();
    
    // Print to serial
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" cm");
    
    delay(100);
  }`,
      instructions: [
        'Connect the HC-SR04 sensor: VCC to 5V, GND to GND, TRIG to D9, ECHO to D10',
        'Connect the SSD1306 OLED display: VCC to 5V, GND to GND, SDA to A4, SCL to A5',
        'Upload the code to Arduino Uno',
        'Power on the system and observe distance readings on the OLED display',
        'Test by moving objects at different distances from the sensor',
        'Check serial monitor for detailed distance measurements'
      ],
      images: {
        wiring: '/images/projects/distance-monitor-wiring.jpg',
        components: ['/images/components/arduino-uno.jpg', '/images/components/hc-sr04.jpg', '/images/components/ssd1306.jpg']
      }
    },
    {
      id: 'motion-detector',
      name: 'Smart Motion Detector',
      description: 'PIR motion sensor with OLED display and buzzer alert system',
      difficulty: 'beginner',
      estimatedTime: '1 hour',
      components: ['arduino-uno-r3', 'pir-hc-sr501', 'ssd1306'],
      connections: [
        {
          from: { component: 'arduino-uno-r3', pin: '5V' },
          to: { component: 'pir-hc-sr501', pin: 'VCC' },
          wire: 'Red wire',
          description: 'Power supply for PIR sensor'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'GND' },
          to: { component: 'pir-hc-sr501', pin: 'GND' },
          wire: 'Black wire',
          description: 'Ground connection'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'D2' },
          to: { component: 'pir-hc-sr501', pin: 'OUT' },
          wire: 'Yellow wire',
          description: 'Motion detection signal'
        },
        {
          from: { component: 'arduino-uno-r3', pin: '5V' },
          to: { component: 'ssd1306', pin: 'VCC' },
          wire: 'Red wire',
          description: 'Power supply for OLED display'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'GND' },
          to: { component: 'ssd1306', pin: 'GND' },
          wire: 'Black wire',
          description: 'Ground connection'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'A4' },
          to: { component: 'ssd1306', pin: 'SDA' },
          wire: 'Blue wire',
          description: 'I2C Data line'
        },
        {
          from: { component: 'arduino-uno-r3', pin: 'A5' },
          to: { component: 'ssd1306', pin: 'SCL' },
          wire: 'Green wire',
          description: 'I2C Clock line'
        }
      ],
      code: `#include <Wire.h>
  #include <Adafruit_GFX.h>
  #include <Adafruit_SSD1306.h>
  
  #define PIR_PIN 2
  #define BUZZER_PIN 3
  #define OLED_RESET -1
  #define SCREEN_WIDTH 128
  #define SCREEN_HEIGHT 64
  
  Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
  
  bool motionDetected = false;
  bool lastMotionState = false;
  unsigned long motionStartTime = 0;
  int motionCount = 0;
  
  void setup() {
    Serial.begin(115200);
    
    // Initialize pins
    pinMode(PIR_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    
    // Initialize OLED display
    if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
      Serial.println(F("SSD1306 allocation failed"));
      for(;;);
    }
    
    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,0);
    display.println("Motion");
    display.println("Detector");
    display.display();
    delay(2000);
    
    // Wait for PIR sensor to stabilize
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,0);
    display.println("Calibrating...");
    display.println("Please wait 30s");
    display.display();
    delay(30000);
  }
  
  void loop() {
    motionDetected = digitalRead(PIR_PIN);
    
    // Detect motion start
    if (motionDetected && !lastMotionState) {
      motionStartTime = millis();
      motionCount++;
      digitalWrite(BUZZER_PIN, HIGH);
      delay(100);
      digitalWrite(BUZZER_PIN, LOW);
    }
    
    // Detect motion end
    if (!motionDetected && lastMotionState) {
      digitalWrite(BUZZER_PIN, LOW);
    }
    
    // Update display
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    
    display.setCursor(0,0);
    display.println("Motion Detector");
    display.println("---------------");
    
    if (motionDetected) {
      display.setTextColor(SSD1306_WHITE);
      display.setTextSize(2);
      display.println("MOTION");
      display.println("DETECTED!");
      display.setTextSize(1);
      display.setTextColor(SSD1306_WHITE);
      display.print("Duration: ");
      display.print((millis() - motionStartTime) / 1000);
      display.println("s");
    } else {
      display.setTextColor(SSD1306_WHITE);
      display.setTextSize(2);
      display.println("NO MOTION");
      display.setTextSize(1);
      display.setTextColor(SSD1306_WHITE);
    }
    
    display.println("---------------");
    display.print("Total alerts: ");
    display.println(motionCount);
    
    display.display();
    
    // Print to serial
    if (motionDetected) {
      Serial.println("Motion detected!");
    }
    
    lastMotionState = motionDetected;
    delay(100);
  }`,
      instructions: [
        'Connect the PIR sensor: VCC to 5V, GND to GND, OUT to D2',
        'Connect the SSD1306 OLED display: VCC to 5V, GND to GND, SDA to A4, SCL to A5',
        'Connect a buzzer to pin D3 (optional for sound alerts)',
        'Upload the code to Arduino Uno',
        'Power on and wait 30 seconds for sensor calibration',
        'Wave your hand in front of the sensor to test motion detection',
        'Check the OLED display for motion status and alert count'
      ],
      images: {
        wiring: '/images/projects/motion-detector-wiring.jpg',
        components: ['/images/components/arduino-uno.jpg', '/images/components/pir.jpg', '/images/components/ssd1306.jpg']
      }
    }
  ];
  
  // Function to suggest projects based on selected components
  export function suggestProjects(selectedComponents: string[]): Project[] {
    const suggestions: Project[] = [];
    
    for (const project of projectsDatabase) {
      // Check if all required components are selected
      const hasAllComponents = project.components.every(componentId => 
        selectedComponents.includes(componentId)
      );
      
      if (hasAllComponents) {
        suggestions.push(project);
      }
    }
    
    // Sort by difficulty (beginner first)
    suggestions.sort((a, b) => {
      const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
    
    return suggestions;
  }
  
  // Function to get component details
  export function getComponent(id: string): Component | undefined {
    return componentsDatabase.find(component => component.id === id);
  }
  
  // Function to get project details
  export function getProject(id: string): Project | undefined {
    return projectsDatabase.find(project => project.id === id);
  }