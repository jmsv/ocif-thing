import {
  finishShapeDrawing,
  startShapeDrawing,
  updateShapeDrawing,
} from "../actions/shapeDrawingActions";
import type { EditorPlugin } from "./types";

// We'll need a way to track the drawing node ID across events
// For now, we'll use a module-level variable - in a real implementation,
// this could be managed by the plugin manager or passed through event context
let drawingNodeId: string | null = null;

export const shapeDrawingPlugin: EditorPlugin = {
  name: "shape-drawing",

  onMouseDown: (event) => {
    const { editor, originalEvent } = event;

    // Handle shape drawing start for rectangle and oval modes
    if (editor.mode === "rectangle" || editor.mode === "oval") {
      const nodeId = startShapeDrawing(
        editor,
        originalEvent as React.MouseEvent,
        editor.mode
      );
      drawingNodeId = nodeId || null;
      return true; // Handled
    }
    return false; // Not handled
  },

  onMouseMove: (event) => {
    const { editor, originalEvent } = event;

    // Handle shape drawing update when actively drawing
    if (editor.editorState.isDrawingShape && drawingNodeId) {
      updateShapeDrawing(
        editor,
        originalEvent as React.MouseEvent,
        drawingNodeId
      );
      return true; // Handled
    }
    return false; // Not handled
  },

  onMouseUp: (event) => {
    const { editor } = event;

    // Handle shape drawing completion
    if (editor.editorState.isDrawingShape && drawingNodeId) {
      finishShapeDrawing(editor, drawingNodeId);
      drawingNodeId = null; // Clear the state
      return true; // Handled
    }
    return false; // Not handled
  },
};
