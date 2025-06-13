import { useCallback } from "react";
import type { KeyboardEvent } from "react";

import type { PluginManager } from "../plugins/PluginManager";
import type { UseOcifEditor } from "./useOcifEditor";

interface UseKeyboardShortcutsProps {
  editor: UseOcifEditor;
  pluginManager: PluginManager;
}

export const useKeyboardShortcuts = ({
  editor,
  pluginManager,
}: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // First, try to handle via plugin keyboard shortcuts
      const shortcutHandled = pluginManager.handleKeyboardShortcut(e, editor);
      if (shortcutHandled) {
        return;
      }

      // Then try plugin event handlers for any additional keydown handling
      const editorEvent = {
        type: "keydown" as const,
        originalEvent: e,
        editor,
      };

      pluginManager.handleEvent(editorEvent);
    },
    [editor, pluginManager]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      // Try plugin event handlers for keyup handling
      const editorEvent = {
        type: "keyup" as const,
        originalEvent: e,
        editor,
      };

      pluginManager.handleEvent(editorEvent);
    },
    [editor, pluginManager]
  );

  return {
    handleKeyDown,
    handleKeyUp,
  };
};
