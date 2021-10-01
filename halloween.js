const { OpenRGBClient } = require("openrgb");
const Rainbow = require("rainbowvis.js");

const purple = "f4831b";
const orange = "902ebb";

const rainbow = new Rainbow();
rainbow.setSpectrum(orange, purple, orange);

const makeColor = (hex) => ({
  red: parseInt(hex.slice(0, 2), 16),
  green: parseInt(hex.slice(2, 4), 16),
  blue: parseInt(hex.slice(-2), 16),
});

let maxLength = 0;
let iter = 0;
let flickerCount = 0;
const intervals = [];

(async () => {
  const client = new OpenRGBClient({
    host: "localhost",
    port: 6742,
    name: "Halloween"
  });

  await client.connect();
  const controllerCount = await client.getControllerCount();

  for (let deviceId = 0; deviceId < controllerCount; deviceId++) {
    const device = await client.getDeviceController(deviceId);
    rainbow.setNumberRange(0, device.colors.length);
    if (maxLength < device.colors.length) {
      maxLength = device.colors.length;
    }
    intervals.push(setInterval(async () => {
      iter === maxLength? iter = 0 : iter += 1;
      let colors = Array(device.colors.length).fill(0).map(
        (color, idx) => makeColor(
          rainbow.colorAt((idx + iter) % maxLength)
        )
      );

      if (flickerCount === 0 && Math.floor(Math.random() * 800) === 1) {
        flickerCount = 1;
      }
      
      if (flickerCount > 0) {
        if (flickerCount % 2 === 1) {
          colors = Array(device.colors.length).fill({red: 0x88, blue: 0, green: 0})
        }
        flickerCount >=6 ? flickerCount = 0: flickerCount += 1;
      }

      await client.updateLeds(deviceId, colors);
    }, 100));
  }

  process.on('SIGINT', () => {
    intervals.forEach(id => clearInterval(id));
    client.disconnect();
  })
})();
