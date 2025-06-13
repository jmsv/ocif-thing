import { Circle } from "lucide-react";

import { setTemporaryHandMode } from "./handToolPlugin";
import type { EditorPlugin } from "./types";

export const ovalToolPlugin: EditorPlugin = {
  name: "oval-tool",

  addToolbarItems: () => [
    {
      id: "oval",
      type: "toggle",
      icon: Circle,
      label: "Oval",
      tooltip: "Draw ovals and circles (O)",
      shortcut: "o",
      isActive: (editor) => editor.mode === "oval",
      onClick: (editor) => editor.setMode("oval"),
      group: "shapes",
      priority: 70,
    },
  ],

  addKeyboardShortcuts: () => [
    {
      id: "oval-tool",
      key: "o",
      description: "Switch to oval tool",
      handler: (editor, event) => {
        event.preventDefault();
        setTemporaryHandMode(false);
        editor.setMode("oval");
        return true;
      },
      priority: 70,
    },
  ],
};
