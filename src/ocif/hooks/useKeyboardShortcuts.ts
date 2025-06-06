import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";

import { copySelectedNodes } from "../actions/copySelectedNodes";
import { deleteSelectedNodes } from "../actions/deleteSelectedNodes";
import { moveSelectedNodes } from "../actions/moveSelectedNodes";
import { pasteNodes } from "../actions/pasteNodes";
import { selectAllNodes } from "../actions/selectAllNodes";
import type { CopiedNode } from "../actions/types";
import type { CanvasEditor } from "./useCanvasEditor";

interface UseKeyboardShortcutsProps {
  editor: CanvasEditor;
}

export const useKeyboardShortcuts = ({ editor }: UseKeyboardShortcutsProps) => {
  const [copiedNodes, setCopiedNodes] = useState<CopiedNode[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const modifierKey = e.ctrlKey || e.metaKey;

      if (e.key === "a" && modifierKey) {
        e.preventDefault();
        selectAllNodes(editor);
      } else if (e.key === "c" && modifierKey) {
        const copiedNodesWithResources = copySelectedNodes(editor);
        setCopiedNodes(copiedNodesWithResources);
      } else if (e.key === "v" && modifierKey) {
        pasteNodes(editor, copiedNodes);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedNodes(editor);
      } else if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();

        const moveAmount = e.shiftKey ? 10 : 1;
        const directionMap = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
        } as const;

        const direction = directionMap[e.key as keyof typeof directionMap];
        moveSelectedNodes(editor, direction, moveAmount);
      } else if (e.key === "v" && !modifierKey) {
        e.preventDefault();
        editor.setMode("select");
      } else if (e.key === "h" && !modifierKey) {
        e.preventDefault();
        editor.setMode("hand");
      } else if (e.key === "r" && !modifierKey) {
        e.preventDefault();
        editor.setMode("rectangle");
      }
    },
    [editor, copiedNodes]
  );

  return {
    copiedNodes,
    setCopiedNodes,
    handleKeyDown,
  };
};
