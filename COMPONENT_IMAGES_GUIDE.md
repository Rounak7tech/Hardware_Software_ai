# Component Images Guide

This guide explains how to add component images to the Custom Build section, including Fritzing-style images.

## Image Structure

Component images should be placed in the `public/assets/components/` directory with the following structure:

```
public/assets/components/
├── microcontrollers/
│   ├── arduino.png          # Arduino Uno R3
│   ├── esp32.png            # ESP32 DevKit
│   ├── arduino-nano.png     # Arduino Nano
│   └── raspberry-pi.png     # Raspberry Pi
├── sensors/
│   ├── dht11.png            # DHT11 sensor
│   ├── ultrasonic.png       # HC-SR04 ultrasonic
│   ├── soil-moisture.png    # Soil moisture sensor
│   └── bme280.png           # BME280 sensor
├── drivers/
│   ├── l298n.png            # L298N motor driver
│   ├── relay.png            # Relay module
│   └── servo.png            # Servo motor
├── breadboard-half.png      # Half breadboard
├── breadboard-full.png      # Full breadboard
├── resistor.png             # Resistor
├── capacitor-electrolytic.png
├── capacitor-ceramic.png
├── led.png                  # LED
├── pushbutton.png           # Push button
├── diode.png                # Diode
├── transistor-npn.png       # NPN transistor
└── battery-9v.png           # 9V battery
```

## Image Requirements

### Best Practices for Component Images:

1. **Fritzing-Style Images**: 
   - Use Fritzing-style SVG or PNG images for a professional look
   - Ensure images show the component from a top-down perspective (breadboard view)
   - Include visible pin positions/indicators when possible

2. **Image Format**:
   - **Recommended**: PNG with transparent background
   - **Alternative**: SVG for scalable vector graphics
   - **Size**: Optimal size varies by component:
     - Microcontrollers: 120-200px width
     - Sensors: 60-100px width
     - Small components (LED, resistor): 30-60px width
     - Breadboards: 160-300px width

3. **Pin Positioning**:
   - Pin positions are defined as percentages (0-100) relative to the image
   - Top-left corner is (0, 0), bottom-right is (100, 100)
   - Pins should match the visual pin locations in the image

## Adding New Component Images

### Step 1: Add Image File
Place your image in the appropriate directory:
```bash
# Example: Adding a new sensor
public/assets/components/sensors/pir-sensor.png
```

### Step 2: Update Component Library
In `src/components/CustomBuild.tsx`, add your component:

```typescript
{
  id: 'pir-sensor',
  name: 'PIR Motion Sensor',
  type: 'sensor',
  category: 'Parts',
  image: '/assets/components/sensors/pir-sensor.png',
  width: 60,        // Optional: specify width in pixels
  height: 60,       // Optional: specify height in pixels
  pins: [
    { name: 'VCC', x: 10, y: 10, type: 'power' },
    { name: 'OUT', x: 50, y: 50, type: 'digital' },
    { name: 'GND', x: 10, y: 90, type: 'ground' },
  ]
}
```

### Step 3: Pin Positioning Guide

To determine pin positions:
1. Open your component image in an image editor
2. Note the pixel coordinates of each pin
3. Convert to percentages:
   - `x_percent = (pin_x_pixel / image_width) * 100`
   - `y_percent = (pin_y_pixel / image_height) * 100`

Example:
- Image size: 120x80 pixels
- Pin at pixel (60, 40)
- Percentage: x = 50%, y = 50%

## Using Fritzing Images

### Getting Fritzing Component Images:

1. **From Fritzing Software**:
   - Open Fritzing
   - Right-click on a component in Breadboard view
   - Export as PNG/SVG
   - Save to `public/assets/components/`

2. **Online Resources**:
   - Fritzing Parts Library: https://github.com/fritzing/fritzing-parts
   - Extract SVG files and convert to PNG if needed

3. **Creating Custom Fritzing-Style Images**:
   - Use Fritzing to design components
   - Export from Breadboard view for best results
   - Ensure transparent background

## Image Optimization Tips

1. **File Size**: Keep images under 100KB when possible
2. **Transparency**: Use PNG with alpha channel for transparent backgrounds
3. **Dimensions**: Scale images appropriately (components scale on canvas)
4. **Consistency**: Maintain similar styling across all component images

## Fallback Behavior

If an image doesn't exist:
- The component will show a placeholder image
- Pin functionality will still work
- Users can add the image later without breaking functionality

## Testing Images

After adding images:
1. Start the dev server: `npm run dev`
2. Navigate to Custom Build section
3. Verify images appear in the component library
4. Drag components to canvas and check:
   - Image displays correctly
   - Pin positions align with image
   - Hover tooltips show correct pin names

## Example: Complete Component Entry

```typescript
{
  id: 'bme280',
  name: 'BME280 Sensor',
  type: 'sensor',
  category: 'Parts',
  image: '/assets/components/sensors/bme280.png',
  width: 70,
  height: 50,
  pins: [
    { name: 'VCC', x: 10, y: 10, type: 'power' },
    { name: 'GND', x: 10, y: 90, type: 'ground' },
    { name: 'SCL', x: 70, y: 30, type: 'i2c' },
    { name: 'SDA', x: 90, y: 30, type: 'i2c' },
    { name: 'CSB', x: 50, y: 50, type: 'digital' },
    { name: 'SDO', x: 50, y: 70, type: 'digital' },
  ]
}
```

## Troubleshooting

**Images not showing?**
- Check file path matches exactly (case-sensitive)
- Ensure file is in `public/assets/components/`
- Verify file extension (.png, .svg)
- Check browser console for 404 errors

**Pin positions incorrect?**
- Recalculate percentages based on actual image dimensions
- Use image editing tool to measure pin positions
- Adjust x/y values in component definition

**Image too large/small?**
- Add `width` and `height` properties to component definition
- Images scale proportionally on canvas


