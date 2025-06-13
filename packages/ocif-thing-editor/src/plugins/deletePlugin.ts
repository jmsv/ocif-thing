import { deleteSelectedNodes } from "../actions/deleteSelectedNodes";
import type { EditorPlugin } from "./types";

export const deletePlugin: EditorPlugin = {
  name: "delete",

  addKeyboardShortcuts: () => [
    {
      id: "delete",
      key: "Delete",
      description: "Delete selected nodes",
      handler: (editor) => {
        deleteSelectedNodes(editor);
        return true;
      },
      priority: 100,
    },
    {
      id: "backspace-delete",
      key: "Backspace",
      description: "Delete selected nodes",
      handler: (editor) => {
        deleteSelectedNodes(editor);
        return true;
      },
      priority: 100,
    },
  ],
};
