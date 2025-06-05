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
export function screenToCanvas(
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
