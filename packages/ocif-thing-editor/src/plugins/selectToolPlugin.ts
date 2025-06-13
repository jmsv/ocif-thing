import { MousePointer2 } from "lucide-react";

import { setTemporaryHandMode } from "./handToolPlugin";
import type { EditorPlugin } from "./types";

export const selectToolPlugin: EditorPlugin = {
  name: "select-tool",

  addToolbarItems: () => [
    {
      id: "select",
      type: "toggle",
      icon: MousePointer2,
      label: "Select",
      tooltip: "Select and move objects (V)",
      shortcut: "v",
      isActive: (editor) => editor.mode === "select",
      onClick: (editor) => editor.setMode("select"),
      group: "tools",
      priority: 100, // Highest priority - appears first
    },
  ],

  addKeyboardShortcuts: () => [
    {
      id: "select-tool",
      key: "v",
      description: "Switch to select tool",
      handler: (editor, event) => {
        event.preventDefault();
        setTemporaryHandMode(false);
        editor.setMode("select");
        return true;
      },
      priority: 70,
    },
  ],
};
