import { Square } from "lucide-react";

import { setTemporaryHandMode } from "./handToolPlugin";
import type { EditorPlugin } from "./types";

export const rectangleToolPlugin: EditorPlugin = {
  name: "rectangle-tool",

  addToolbarItems: () => [
    {
      id: "rectangle",
      type: "toggle",
      icon: Square,
      label: "Rectangle",
      tooltip: "Draw rectangles (R)",
      shortcut: "r",
      isActive: (editor) => editor.mode === "rectangle",
      onClick: (editor) => editor.setMode("rectangle"),
      group: "shapes",
      priority: 80,
    },
  ],

  addKeyboardShortcuts: () => [
    {
      id: "rectangle-tool",
      key: "r",
      description: "Switch to rectangle tool",
      handler: (editor, event) => {
        event.preventDefault();
        setTemporaryHandMode(false);
        editor.setMode("rectangle");
        return true;
      },
      priority: 70,
    },
  ],
};
