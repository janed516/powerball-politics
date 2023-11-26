import addWheelListener from "./addWheelListener.js";

let _scrollSrc, _graphicsContainer, _stage, _draggableBg;

export let getGraphCoordinates = (function () {
  let ctx = {
    global: { x: 0, y: 0 }, // store it inside closure to avoid GC pressure
  };

  return function (x, y) {
    ctx.global.x = x;
    ctx.global.y = y;
    return PIXI.InteractionData.prototype.getLocalPosition.call(
      ctx,
      _graphicsContainer
    );
  };
})();

export function bindInput(scrollSrc, graphicsContainer, stage, draggableBg) {
  _scrollSrc = scrollSrc;
  _graphicsContainer = graphicsContainer;
  _stage = stage;
  _draggableBg = draggableBg;

  addWheelListener(_scrollSrc, function (e) {
    zoom(e.clientX, e.clientY, e.deltaY < 0);
  });

  if (_draggableBg) {
    addDragNDrop();
  }

  function zoom(x, y, isZoomIn) {
    let direction = isZoomIn ? 1 : -1;
    let factor = 1 + direction * 0.03;
    let newScVal = _graphicsContainer.scale.x * factor;
    if (0.3 > newScVal || newScVal > 3) return;
    _graphicsContainer.scale.x = newScVal;
    _graphicsContainer.scale.y = newScVal;

    // Technically code below is not required, but helps to zoom on mouse
    // cursor, instead center of _graphicsContainer coordinates
    let beforeTransform = getGraphCoordinates(x, y);
    _graphicsContainer.updateTransform();
    let afterTransform = getGraphCoordinates(x, y);

    _graphicsContainer.position.x +=
      (afterTransform.x - beforeTransform.x) * _graphicsContainer.scale.x;
    _graphicsContainer.position.y +=
      (afterTransform.y - beforeTransform.y) * _graphicsContainer.scale.y;
    _graphicsContainer.updateTransform();
  }

  function addDragNDrop() {
    _draggableBg.interactive = true;

    let isDragging = false,
      prevX,
      prevY;

    _draggableBg.mousedown = function (evt) {
      let moveData = evt.data;
      let pos = moveData.global;
      prevX = pos.x;
      prevY = pos.y;
      isDragging = true;
    };

    _draggableBg.mousemove = function (evt) {
      if (!isDragging) {
        return;
      }
      let moveData = evt.data;
      let pos = moveData.global;
      let dx = pos.x - prevX;
      let dy = pos.y - prevY;

      _graphicsContainer.position.x += dx;
      _graphicsContainer.position.y += dy;
      prevX = pos.x;
      prevY = pos.y;
    };

    _draggableBg.mouseup = function (evt) {
      isDragging = false;
    };
  }
}
