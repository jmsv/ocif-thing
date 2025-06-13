import { useCallback } from "react";

import type { EditorEvent } from "../plugins/types";
import type { UseOcifEditor } from "./useOcifEditor";
import { usePlugins } from "./usePlugins";

interface UseMouseEventsProps {
  editor: UseOcifEditor;
}

export const useMouseEvents = ({ editor }: UseMouseEventsProps) => {
  const pluginManager = usePlugins();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Create plugin event
      const event: EditorEvent = {
        type: "mousedown",
        originalEvent: e,
        editor,
      };

      // All mouse down events are now handled by plugins
      pluginManager.handleEvent(event);
    },
    [editor, pluginManager]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Create plugin event
      const event: EditorEvent = {
        type: "mousemove",
        originalEvent: e,
        editor,
      };

      // All mouse move events are now handled by plugins
      pluginManager.handleEvent(event);
    },
    [editor, pluginManager]
  );

  const handleMouseUp = useCallback(() => {
    const { mode } = editor;

    // Create plugin event
    const event: EditorEvent = {
      type: "mouseup",
      originalEvent: {} as React.MouseEvent, // Mock event since we don't have the original
      editor,
    };

    // Plugins handle their own cleanup
    pluginManager.handleEvent(event);

    // Reset all dragging states - this cleanup logic remains in the core
    editor.setEditorState((prev) => ({
      ...prev,
      isDragging: false,
      isSelecting: false,
      isDraggingNodes: false,
      isDrawingShape: false,
      isRotating: false,
      drawingPoints: undefined,
      initialNodePositions: new Map(),
      initialNodeStates: new Map(),
    }));

    // Clear selection bounds for select mode
    if (mode === "select") {
      editor.setSelectionBounds(null);
    }
  }, [editor, pluginManager]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
