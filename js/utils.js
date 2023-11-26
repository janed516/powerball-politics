import * as utils from "./utils.js";

// ------------------------------------------------------------------------------

function computeDistance(n1, n2) {
  return Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2));
}

export function checkIntersections(circleA, othCircles) {
  for (let othCircle of othCircles) {
    let doesCollide = checkCollision(circleA, othCircle);
    if (doesCollide) return true;
  }
  return false;
}

export function checkCollision(circleA, circleB) {
  let totSize = circleA.radius + circleB.radius;
  let d = computeDistance(circleA.pos, circleB.pos);
  return d <= totSize;
}

// ------------------------------------------------------------------------------

export async function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

// ------------------------------------------------------------------------------

// ref: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export function getHash(inp, mod = 9999999) {
  inp = inp || "";
  let hash = 28213,
    i,
    chr;
  for (i = 0; i < inp.length; i++) {
    chr = inp.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash % mod);
}

// ------------------------------------------------------------------------------

export function pol2rect(r, θ) {
  return { x: r * Math.cos(θ), y: r * Math.sin(θ) };
}

// rotates point(p) around centre(c) by angle(a) in radians
export function rotateAroundPoint(p, c, a) {
  return {
    x: c.x + (p.x - c.x) * Math.cos(a) - (p.y - c.y) * Math.sin(a),
    y: c.y + (p.x - c.x) * Math.sin(a) + (p.y - c.y) * Math.cos(a),
  };
}

// get vector going from src to target
export function getVectorBetween(src, tgt, normalize = false) {
  let v = {
    x: tgt.x - src.x,
    y: tgt.y - src.y,
  };
  if (normalize) {
    let l = Math.sqrt(v.x * v.x + v.y * v.y);
    v.x /= l;
    v.y /= l;
  }
  return v;
}

// ref: https://stackoverflow.com/questions/49579960/how-to-get-random-point-near-edges-of-a-square-in-javascript
export function randomPointNearRect(x, y, w, h, minDist, maxDist) {
  let dist = utils.seededRandomFloat(maxDist, minDist);
  x += dist;
  y += dist;
  w -= dist * 2;
  h -= dist * 2;
  if (utils.seededRandomFloat() < w / (w + h)) {
    // top bottom
    x = utils.seededRandomFloat() * w + x;
    y = utils.seededRandomFloat() < 0.5 ? y : y + h - 1;
  } else {
    y = utils.seededRandomFloat() * h + y;
    x = utils.seededRandomFloat() < 0.5 ? x : x + w - 1;
  }
  return { x, y };
}

// ------------------------------------------------------------------------------

// ref: https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
export function downloadAsFile(strContent, filename) {
  let element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(strContent)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// ------------------------------------------------------------------------------

let seed = 42;

export function setSeed(newSeed) {
  seed = newSeed;
}

// ref: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
export function seededRandomFloat(max, min) {
  max = max || 1;
  min = min || 0;

  seed = (seed * 9301 + 49297) % 233280;
  let rnd = seed / 233280;

  return min + rnd * (max - min);
}
