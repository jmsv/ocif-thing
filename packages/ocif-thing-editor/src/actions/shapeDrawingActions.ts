import type { EditorMode } from "../contexts/EditorContext";
import type { UseOcifEditor } from "../hooks/useOcifEditor";
import {
  getRelativeMousePosition,
  screenToCanvasPosition,
} from "../utils/coordinates";
import { generateId } from "../utils/generateId";

// Shape drawing actions (rectangle/oval)
export const startShapeDrawing = (
  editor: UseOcifEditor,
  e: React.MouseEvent,
  mode: EditorMode
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
    isDrawingShape: true,
    shapeStart: { x: canvasX, y: canvasY },
  }));

  editor.setSelectedNodes(new Set());
  const newNodeId = generateId();

  const newNode = {
    id: newNodeId,
    position: [canvasX, canvasY],
    size: [0, 0],
    data: [
      {
        type: mode === "oval" ? "@ocif/node/oval" : "@ocif/node/rect",
        strokeWidth: 2,
        strokeColor: "#000",
        fillColor: "#fff",
      },
    ],
  };

  editor.updateDocument((doc) => ({
    ...doc,
    nodes: [...(doc.nodes || []), newNode],
  }));

  return newNodeId;
};

export const updateShapeDrawing = (
  editor: UseOcifEditor,
  e: React.MouseEvent,
  drawingNodeId: string
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
    if (!prev.isDrawingShape) return prev;

    const minX = Math.min(prev.shapeStart.x, canvasX);
    const minY = Math.min(prev.shapeStart.y, canvasY);
    const width = Math.abs(canvasX - prev.shapeStart.x);
    const height = Math.abs(canvasY - prev.shapeStart.y);

    editor.updateNodeProperties(drawingNodeId, {
      position: [minX, minY],
      size: [width, height],
    });

    return prev;
  });
};

export const finishShapeDrawing = (
  editor: UseOcifEditor,
  drawingNodeId: string | null
) => {
  if (drawingNodeId) {
    const node = editor.document.nodes?.find((n) => n.id === drawingNodeId);
    if (
      node &&
      Array.isArray(node.size) &&
      node.size.length >= 2 &&
      Array.isArray(node.position) &&
      node.position.length >= 2
    ) {
      const width = node.size[0];
      const height = node.size[1];
      if (width < 20 || height < 20) {
        const x = node.position[0];
        const y = node.position[1];
        editor.updateNodeProperties(drawingNodeId, {
          position: [x, y],
          size: [100, 100],
        });
      }
    }
    editor.setMode("select");
  }

  editor.setEditorState((prev) => ({
    ...prev,
    isDrawingShape: false,
    shapeStart: { x: 0, y: 0 },
  }));
};
