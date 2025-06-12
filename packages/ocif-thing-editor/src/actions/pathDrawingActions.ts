import type { UseOcifEditor } from "../hooks/useOcifEditor";
import {
  getRelativeMousePosition,
  screenToCanvasPosition,
} from "../utils/coordinates";
import {
  getPerfectPointsFromPoints,
  getSvgPathFromPoints,
} from "../utils/drawing";
import { generateId } from "../utils/generateId";

// Path drawing actions (draw tool)
export const startPathDrawing = (
  editor: UseOcifEditor,
  e: React.MouseEvent
) => {
  const container = editor.canvasRef.current;
  if (!container) return;

  const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);
  const { x: canvasX, y: canvasY } = screenToCanvasPosition(
    clientX,
    clientY,
    editor.editorState.position,
    editor.editorState.scale
  );

  editor.setEditorState((prev) => ({
    ...prev,
    isDrawing: true,
    drawingPoints: [[canvasX, canvasY]],
  }));
};

export const updatePathDrawing = (
  editor: UseOcifEditor,
  e: React.MouseEvent
) => {
  const container = editor.canvasRef.current;
  if (!container) return;

  const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);
  const { x: canvasX, y: canvasY } = screenToCanvasPosition(
    clientX,
    clientY,
    editor.editorState.position,
    editor.editorState.scale
  );

  editor.setEditorState((prev) => {
    if (!prev.drawingPoints) return prev;
    return {
      ...prev,
      drawingPoints: [...prev.drawingPoints, [canvasX, canvasY]],
    };
  });
};

export const finishPathDrawing = (editor: UseOcifEditor) => {
  editor.setEditorState((prev) => {
    if (prev.drawingPoints) {
      const points = prev.drawingPoints;
      if (points.length >= 2) {
        const perfectPoints = getPerfectPointsFromPoints(points);

        const xCoords = perfectPoints.map(([x]) => x);
        const yCoords = perfectPoints.map(([, y]) => y);
        const minX = Math.min(...xCoords);
        const minY = Math.min(...yCoords);
        const maxX = Math.max(...xCoords);
        const maxY = Math.max(...yCoords);

        const adjustedPoints = perfectPoints.map(([x, y]) => [
          x - minX,
          y - minY,
        ]);

        const path = getSvgPathFromPoints(adjustedPoints);

        const newNode = {
          id: generateId(),
          position: [minX, minY],
          size: [maxX - minX, maxY - minY],
          data: [
            {
              type: "@ocif/node/path",
              path,
              fillColor: "#000",
            },
          ],
        };

        editor.updateDocument((doc) => ({
          ...doc,
          nodes: [...(doc.nodes || []), newNode],
        }));
      }
    }

    return {
      ...prev,
      drawingPoints: undefined,
      isDrawing: false,
    };
  });
};
