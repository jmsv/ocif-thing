import { finishRotation, updateRotation } from "../actions/rotationActions";
import type { EditorPlugin } from "./types";

export const rotationPlugin: EditorPlugin = {
  name: "rotation",

  onMouseMove: (event) => {
    const { editor, originalEvent } = event;

    // Handle rotation update when actively rotating in select mode
    if (editor.editorState.isRotating && editor.mode === "select") {
      updateRotation(editor, originalEvent as React.MouseEvent);
      return true; // Handled
    }
    return false; // Not handled
  },

  onMouseUp: (event) => {
    const { editor } = event;

    // Handle rotation completion
    if (editor.editorState.isRotating) {
      finishRotation(editor);
      return true; // Handled
    }
    return false; // Not handled
  },
};
