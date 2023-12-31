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

const textScaleFactor = 0.4;
const labelStyle = {
  align: "center",
  fontSize: "70px",
};

// let _params = { size: 40, color: 0xff0000 }
export function getGfx_party(params) {
  let sprCont = new PIXI.Container();

  let outerDotBorder = new PIXI.Graphics();
  outerDotBorder.beginFill(params.color);
  outerDotBorder.drawCircle(0, 0, params.size);
  outerDotBorder.endFill();
  sprCont.addChild(outerDotBorder);

  let outerDotFill = new PIXI.Graphics();
  let colStr = byteToHexStr(params.color);
  let lighterCol = adjust(colStr, 120);
  let colByte = hexStrToByte(lighterCol);
  outerDotFill.beginFill(colByte);
  outerDotFill.drawCircle(0, 0, params.size - 0.5);
  outerDotFill.endFill();
  sprCont.addChild(outerDotFill);

  let innerDotSpr = new PIXI.Graphics();
  innerDotSpr.beginFill(params.color);
  innerDotSpr.drawCircle(0, 0, 22);
  innerDotSpr.endFill();
  sprCont.addChild(innerDotSpr);

  let innerWhtCircSpr = new PIXI.Graphics();
  innerWhtCircSpr.beginFill(0xffffff);
  innerWhtCircSpr.drawCircle(0, 0, 20);
  innerWhtCircSpr.endFill();
  sprCont.addChild(innerWhtCircSpr);

  // let dropShadowFilter = new PIXI.DropShadowFilter();
  // dropShadowFilter.color = lighterCol;
  // dropShadowFilter.alpha = 0.2;
  // dropShadowFilter.blur = 6;
  // dropShadowFilter.distance = 20;
  // innerWhtCircSpr.filters = [dropShadowFilter];

  let partyEmojiIcon = params.label.match(/\p{Emoji}+/gu)[0];
  let partyEmojiIconTxt = new PIXI.Text(partyEmojiIcon, labelStyle);
  partyEmojiIconTxt.anchor.set(0.5, 0.5);
  partyEmojiIconTxt.scale.x = textScaleFactor;
  partyEmojiIconTxt.scale.y = textScaleFactor;
  sprCont.addChild(partyEmojiIconTxt);

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
