import {
  startCanvasDrag,
  updateCanvasDrag,
} from "../actions/canvasDragActions";
import type { EditorPlugin } from "./types";

export const canvasDragPlugin: EditorPlugin = {
  name: "canvas-drag",

  onMouseDown: (event) => {
    const { editor, originalEvent } = event;
    // Handle canvas dragging for hand mode
    if (editor.mode === "hand") {
      startCanvasDrag(editor, originalEvent as React.MouseEvent);
      return true; // Handled
    }
    return false; // Not handled, let other plugins try
  },

  onMouseMove: (event) => {
    const { editor, originalEvent } = event;
    // Handle canvas drag update when actively dragging in hand mode
    if (editor.editorState.isDragging && editor.mode === "hand") {
      updateCanvasDrag(editor, originalEvent as React.MouseEvent);
      return true; // Handled
    }
    return false; // Not handled
  },

  // Canvas drag doesn't need special mouseup handling - it's handled in the cleanup
  // in the main mouse up event
};
