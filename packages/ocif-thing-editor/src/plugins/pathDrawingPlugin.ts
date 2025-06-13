import {
  finishPathDrawing,
  startPathDrawing,
  updatePathDrawing,
} from "../actions/pathDrawingActions";
import type { EditorPlugin } from "./types";

export const pathDrawingPlugin: EditorPlugin = {
  name: "path-drawing",

  onMouseDown: (event) => {
    const { editor, originalEvent } = event;

    // Handle path drawing start for draw mode
    if (editor.mode === "draw") {
      startPathDrawing(editor, originalEvent as React.MouseEvent);
      return true; // Handled
    }
    return false; // Not handled
  },

  onMouseMove: (event) => {
    const { editor, originalEvent } = event;

    // Handle path drawing update when actively drawing and in draw mode
    if (editor.editorState.drawingPoints && editor.mode === "draw") {
      updatePathDrawing(editor, originalEvent as React.MouseEvent);
      return true; // Handled
    }
    return false; // Not handled
  },

  onMouseUp: (event) => {
    const { editor } = event;

    // Handle path drawing completion
    if (editor.editorState.drawingPoints) {
      finishPathDrawing(editor);
      return true; // Handled
    }
    return false; // Not handled
  },
};
