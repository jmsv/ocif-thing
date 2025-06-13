import { moveSelectedNodes } from "../actions/moveSelectedNodes";
import type { EditorPlugin } from "./types";

export const movementPlugin: EditorPlugin = {
  name: "movement",

  addKeyboardShortcuts: () => [
    {
      id: "move-up",
      key: "ArrowUp",
      description: "Move selected nodes up (Shift for 10px)",
      handler: (editor, event) => {
        if (editor.mode !== "select") return false;
        event.preventDefault();
        const moveAmount = event.shiftKey ? 10 : 1;
        moveSelectedNodes(editor, "up", moveAmount);
        return true;
      },
      priority: 90,
    },
    {
      id: "move-down",
      key: "ArrowDown",
      description: "Move selected nodes down (Shift for 10px)",
      handler: (editor, event) => {
        if (editor.mode !== "select") return false;
        event.preventDefault();
        const moveAmount = event.shiftKey ? 10 : 1;
        moveSelectedNodes(editor, "down", moveAmount);
        return true;
      },
      priority: 90,
    },
    {
      id: "move-left",
      key: "ArrowLeft",
      description: "Move selected nodes left (Shift for 10px)",
      handler: (editor, event) => {
        if (editor.mode !== "select") return false;
        event.preventDefault();
        const moveAmount = event.shiftKey ? 10 : 1;
        moveSelectedNodes(editor, "left", moveAmount);
        return true;
      },
      priority: 90,
    },
    {
      id: "move-right",
      key: "ArrowRight",
      description: "Move selected nodes right (Shift for 10px)",
      handler: (editor, event) => {
        if (editor.mode !== "select") return false;
        event.preventDefault();
        const moveAmount = event.shiftKey ? 10 : 1;
        moveSelectedNodes(editor, "right", moveAmount);
        return true;
      },
      priority: 90,
    },
  ],
};
