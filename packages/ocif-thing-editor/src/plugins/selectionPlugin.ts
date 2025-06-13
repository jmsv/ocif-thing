import {
  finishSelection,
  startSelection,
  updateSelection,
} from "../actions/selectionActions";
import type { EditorPlugin } from "./types";

export const selectionPlugin: EditorPlugin = {
  name: "selection",

  onMouseDown: (event) => {
    const { editor, originalEvent } = event;
    // Handle selection start for select mode when not already dragging nodes
    if (editor.mode === "select" && !editor.editorState.isDraggingNodes) {
      startSelection(editor, originalEvent as React.MouseEvent);
      return true; // Handled
    }
    return false; // Not handled, let other plugins try
  },

  onMouseMove: (event) => {
    const { editor, originalEvent } = event;
    // Handle selection update when actively selecting
    if (editor.editorState.isSelecting && editor.mode === "select") {
      updateSelection(editor, originalEvent as React.MouseEvent);
      return true; // Handled
    }
    return false; // Not handled
  },

  onMouseUp: (event) => {
    const { editor } = event;
    // Handle selection finish when actively selecting
    if (editor.editorState.isSelecting) {
      finishSelection(editor);
      return true; // Handled
    }
    return false; // Not handled
  },
};
