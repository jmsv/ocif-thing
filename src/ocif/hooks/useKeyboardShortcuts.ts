import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";

import { copySelectedNodes } from "../actions/copySelectedNodes";
import { deleteSelectedNodes } from "../actions/deleteSelectedNodes";
import { moveSelectedNodes } from "../actions/moveSelectedNodes";
import { pasteNodes } from "../actions/pasteNodes";
import { selectAllNodes } from "../actions/selectAllNodes";
import type { CopiedNode } from "../actions/types";
import type { EditorMode } from "../contexts/EditorContext";
import type { UseOcifEditor } from "./useOcifEditor";

interface UseKeyboardShortcutsProps {
  editor: UseOcifEditor;
}

export const useKeyboardShortcuts = ({ editor }: UseKeyboardShortcutsProps) => {
  const [copiedNodes, setCopiedNodes] = useState<CopiedNode[]>([]);
  const [previousMode, setPreviousMode] = useState<EditorMode>("select");
  const [isTemporaryHandMode, setIsTemporaryHandMode] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const modifierKey = e.ctrlKey || e.metaKey;

      if (e.key === " " && !modifierKey) {
        e.preventDefault();
        if (!isTemporaryHandMode) {
          setPreviousMode(editor.mode);
          setIsTemporaryHandMode(true);
          editor.setMode("hand");
        }
      } else if (e.key === "a" && modifierKey) {
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
        if (editor.mode !== "select") return;

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
        setIsTemporaryHandMode(false);
        editor.setMode("select");
      } else if (e.key === "h" && !modifierKey) {
        e.preventDefault();
        setIsTemporaryHandMode(false);
        editor.setMode("hand");
      } else if (e.key === "r" && !modifierKey) {
        e.preventDefault();
        setIsTemporaryHandMode(false);
        editor.setMode("rectangle");
      } else if (e.key === "o" && !modifierKey) {
        e.preventDefault();
        setIsTemporaryHandMode(false);
        editor.setMode("oval");
      } else if (modifierKey && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        editor.zoomBy(0.2);
      } else if (modifierKey && e.key === "-") {
        e.preventDefault();
        editor.zoomBy(-0.2);
      }
    },
    [editor, copiedNodes, isTemporaryHandMode]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " && isTemporaryHandMode) {
        e.preventDefault();
        setIsTemporaryHandMode(false);
        editor.setMode(previousMode);
      }
    },
    [editor, previousMode, isTemporaryHandMode]
  );

  return {
    copiedNodes,
    setCopiedNodes,
    handleKeyDown,
    handleKeyUp,
  };
};
