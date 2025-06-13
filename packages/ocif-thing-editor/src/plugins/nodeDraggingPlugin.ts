import {
  finishNodeDragging,
  updateNodeDragging,
} from "../actions/nodeDraggingActions";
import type { EditorPlugin } from "./types";

export const nodeDraggingPlugin: EditorPlugin = {
  name: "node-dragging",

  onMouseMove: (event) => {
    const { editor, originalEvent } = event;

    // Handle node dragging update when actively dragging nodes in select mode
    if (editor.editorState.isDraggingNodes && editor.mode === "select") {
      updateNodeDragging(editor, originalEvent as React.MouseEvent);
      return true; // Handled
    }
    return false; // Not handled
  },

  onMouseUp: (event) => {
    const { editor } = event;

    // Handle node dragging completion
    if (editor.editorState.isDraggingNodes) {
      finishNodeDragging(editor);
      return true; // Handled
    }
    return false; // Not handled
  },
};
