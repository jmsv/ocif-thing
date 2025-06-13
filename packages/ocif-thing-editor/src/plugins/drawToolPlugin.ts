import { Pencil } from "lucide-react";

import { setTemporaryHandMode } from "./handToolPlugin";
import type { EditorPlugin } from "./types";

export const drawToolPlugin: EditorPlugin = {
  name: "draw-tool",

  addToolbarItems: () => [
    {
      id: "draw",
      type: "toggle",
      icon: Pencil,
      label: "Draw",
      tooltip: "Free drawing (D)",
      shortcut: "d",
      isActive: (editor) => editor.mode === "draw",
      onClick: (editor) => editor.setMode("draw"),
      group: "drawing",
      priority: 60,
    },
  ],

  addKeyboardShortcuts: () => [
    {
      id: "draw-tool",
      key: "d",
      description: "Switch to draw tool",
      handler: (editor, event) => {
        event.preventDefault();
        setTemporaryHandMode(false);
        editor.setMode("draw");
        return true;
      },
      priority: 70,
    },
  ],
};
