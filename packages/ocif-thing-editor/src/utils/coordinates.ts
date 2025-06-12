/**
 * Calculate mouse position relative to a container element
 */
export function getRelativeMousePosition(
  e: React.MouseEvent | MouseEvent,
  container: HTMLElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvasPosition(
  screenX: number,
  screenY: number,
  canvasPosition: { x: number; y: number },
  scale: number
): { x: number; y: number } {
  return {
    x: (screenX - canvasPosition.x) / scale,
    y: (screenY - canvasPosition.y) / scale,
  };
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreenPosition(
  canvasX: number,
  canvasY: number,
  canvasPosition: { x: number; y: number },
  scale: number
): { x: number; y: number } {
  return {
    x: canvasX * scale + canvasPosition.x,
    y: canvasY * scale + canvasPosition.y,
  };
}

/**
 * Calculate delta between two positions scaled for canvas
 */
export function calculateScaledDelta(
  start: { x: number; y: number },
  current: { x: number; y: number },
  scale: number
): { deltaX: number; deltaY: number } {
  return {
    deltaX: (current.x - start.x) / scale,
    deltaY: (current.y - start.y) / scale,
  };
}

/**
 * Calculate the bounding box of a rotated rectangle
 */
export function getRotatedBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
): { left: number; top: number; right: number; bottom: number } {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const corners = [
    [x - centerX, y - centerY],
    [x + width - centerX, y - centerY],
    [x + width - centerX, y + height - centerY],
    [x - centerX, y + height - centerY],
  ];

  const rotatedCorners = corners.map(([dx, dy]) => [
    centerX + dx * cos - dy * sin,
    centerY + dx * sin + dy * cos,
  ]);

  const xs = rotatedCorners.map(([x]) => x);
  const ys = rotatedCorners.map(([, y]) => y);

  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  };
}
