import { Hand } from "lucide-react";

import type { EditorMode } from "../contexts/EditorContext";
import type { EditorPlugin } from "./types";

// Module-level state for temporary hand mode
let previousMode: EditorMode = "select";
let isTemporaryHandMode = false;

export const handToolPlugin: EditorPlugin = {
  name: "hand-tool",

  addToolbarItems: () => [
    {
      id: "hand",
      type: "toggle",
      icon: Hand,
      label: "Hand",
      tooltip: "Pan around the canvas (H)",
      shortcut: "h",
      isActive: (editor) => editor.mode === "hand",
      onClick: (editor) => editor.setMode("hand"),
      group: "tools",
      priority: 90,
    },
  ],

  addKeyboardShortcuts: () => [
    {
      id: "hand-tool",
      key: "h",
      description: "Switch to hand tool",
      handler: (editor, event) => {
        event.preventDefault();
        isTemporaryHandMode = false;
        editor.setMode("hand");
        return true;
      },
      priority: 70,
    },
  ],

  onKeyDown: (editorEvent) => {
    const { originalEvent, editor } = editorEvent;

    if (originalEvent.type === "keydown") {
      const event = originalEvent as React.KeyboardEvent;
      const modifierKey = event.ctrlKey || event.metaKey;

      if (event.key === " " && !modifierKey) {
        event.preventDefault();
        if (!isTemporaryHandMode) {
          previousMode = editor.mode;
          isTemporaryHandMode = true;
          editor.setMode("hand");
        }
        return true;
      }
    }

    return false;
  },

  onKeyUp: (editorEvent) => {
    const { originalEvent, editor } = editorEvent;

    if (originalEvent.type === "keyup") {
      const event = originalEvent as React.KeyboardEvent;

      if (event.key === " " && isTemporaryHandMode) {
        event.preventDefault();
        isTemporaryHandMode = false;
        editor.setMode(previousMode);
        return true;
      }
    }

    return false;
  },
};

// Export functions to let other plugins interact with temporary hand mode
export const setTemporaryHandMode = (value: boolean) => {
  isTemporaryHandMode = value;
};

export const isInTemporaryHandMode = () => isTemporaryHandMode;
