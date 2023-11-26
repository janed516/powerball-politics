// ref: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function adjust(color, amount) {
  const clamp = (val) => Math.min(Math.max(val, 0), 0xff);
  const fill = (str) => ("00" + str).slice(-2);

  const num = parseInt(color.substr(1), 16);
  const red = clamp((num >> 16) + amount);
  const green = clamp(((num >> 8) & 0x00ff) + amount);
  const blue = clamp((num & 0x0000ff) + amount);
  return (
    "#" +
    fill(red.toString(16)) +
    fill(green.toString(16)) +
    fill(blue.toString(16))
  );
}

function byteToHexStr(byteColor) {
  // Add '#' to the start of the color
  let hexColor = "#" + byteColor.toString(16);
  return hexColor;
}

function hexStrToByte(hexColor) {
  // Remove the '#' from the input if present
  hexColor = hexColor.replace(/^#/, "");
  // Parse the hex values to RGB
  let bigint = parseInt(hexColor, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  // Convert RGB values to a byte value
  let byteValue = (r << 16) | (g << 8) | b;
  return byteValue;
}
// ---------------------------------------------------
// RED

// let _params = { size: 40, color: 0xff0000 }
export function getGfx_party(params) {
  let sprCont = new PIXI.Container();

  let outerDotSpr = new PIXI.Graphics();
  let colStr = byteToHexStr(params.color);
  let lighterCol = adjust(colStr, 120);
  let colByte = hexStrToByte(lighterCol);
  outerDotSpr.beginFill(colByte);
  outerDotSpr.drawCircle(0, 0, params.size);
  outerDotSpr.endFill();
  sprCont.addChild(outerDotSpr);

  let innerDotSpr = new PIXI.Graphics();
  innerDotSpr.beginFill(params.color);
  innerDotSpr.drawCircle(0, 0, params.size * 0.15);
  innerDotSpr.endFill();
  sprCont.addChild(innerDotSpr);

  sprCont.interactive = true;
  sprCont.buttonMode = true;
  sprCont.hitArea = new PIXI.Circle(0, 0, params.size);

  return sprCont;
}

// ---------------------------------------------------
// PURPLE

// let _params = { color: 0xff00ff }
export function getGfx_voter(params) {
  let sprCont = new PIXI.Container();

  let innerDotSpr = new PIXI.Graphics();
  innerDotSpr.beginFill(params.color);
  innerDotSpr.drawCircle(0, 0, params.size);
  innerDotSpr.endFill();
  sprCont.addChild(innerDotSpr);

  sprCont.interactive = true;
  sprCont.buttonMode = true;
  sprCont.hitArea = new PIXI.Circle(0, 0, params.size);

  return sprCont;
}

// ---------------------------------------------------
// DEBUG
export function getDebugPoint(params = {}) {
  let size = 10;

  let sprCont = new PIXI.Container();

  let innerDotSpr = new PIXI.Graphics();
  innerDotSpr.beginFill(params.color || 0xff0000);
  innerDotSpr.drawCircle(0, 0, size);
  innerDotSpr.endFill();
  sprCont.addChild(innerDotSpr);

  return sprCont;
}
