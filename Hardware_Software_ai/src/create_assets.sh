#!/bin/bash

# Base folder
mkdir -p public/assets/components/microcontrollers
mkdir -p public/assets/components/sensors
mkdir -p public/assets/components/drivers

# Microcontrollers
touch public/assets/components/microcontrollers/arduino.png
touch public/assets/components/microcontrollers/esp32.png

# Sensors
touch public/assets/components/sensors/dht11.png
touch public/assets/components/sensors/ultrasonic.png

# Drivers
touch public/assets/components/drivers/l298n.png
touch public/assets/components/drivers/relay.png

echo "Folders and placeholder files created successfully!"
