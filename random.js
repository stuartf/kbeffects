const { Client } = require("openrgb-sdk");
const Rainbow = require("rainbowvis.js");

const rainbow = new Rainbow();

const makeColor = (hex) => ({
  red: parseInt(hex.slice(0, 2), 16),
  green: parseInt(hex.slice(2, 4), 16),
  blue: parseInt(hex.slice(-2), 16),
});

const intervals = [];

(async () => {
  const client = new Client({
    host: "localhost",
    port: 6742,
    name: "Random"
  });

  await client.connect();
  const controllerCount = await client.getControllerCount();

  for (let deviceId = 0; deviceId < controllerCount; deviceId++) {
    const { colors } = await client.getControllerData(deviceId);
    rainbow.setNumberRange(0, colors.length);
    intervals.push(setInterval(async () => {
      let newColors = Array(colors.length).fill(0).map(
        () => makeColor(
          Math.floor(Math.random() * 3) === 1 ? "000000" : "888888"
        )
      );
      await client.updateLeds(deviceId, newColors);
    }, 700));
  }

  process.on('SIGINT', () => {
    intervals.forEach(id => clearInterval(id));
    client.disconnect();
  })
})();
