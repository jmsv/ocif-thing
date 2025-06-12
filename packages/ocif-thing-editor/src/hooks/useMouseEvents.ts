import { useCallback, useState } from "react";

import {
  startCanvasDrag,
  updateCanvasDrag,
} from "../actions/canvasDragActions";
import {
  finishNodeDragging,
  updateNodeDragging,
} from "../actions/nodeDraggingActions";
import {
  finishPathDrawing,
  startPathDrawing,
  updatePathDrawing,
} from "../actions/pathDrawingActions";
import { finishRotation, updateRotation } from "../actions/rotationActions";
import {
  finishSelection,
  startSelection,
  updateSelection,
} from "../actions/selectionActions";
import {
  finishShapeDrawing,
  startShapeDrawing,
  updateShapeDrawing,
} from "../actions/shapeDrawingActions";
import type { UseOcifEditor } from "./useOcifEditor";

interface UseMouseEventsProps {
  editor: UseOcifEditor;
}

export const useMouseEvents = ({ editor }: UseMouseEventsProps) => {
  const [drawingNodeId, setDrawingNodeId] = useState<string | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const { mode, editorState } = editor;

      if (mode === "hand") {
        startCanvasDrag(editor, e);
      } else if (mode === "select" && !editorState.isDraggingNodes) {
        startSelection(editor, e);
      } else if (mode === "rectangle" || mode === "oval") {
        const nodeId = startShapeDrawing(editor, e, mode);
        setDrawingNodeId(nodeId || null);
      } else if (mode === "draw") {
        startPathDrawing(editor, e);
      }
    },
    [editor]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const { mode, editorState } = editor;

      if (editorState.isDragging && mode === "hand") {
        updateCanvasDrag(editor, e);
      } else if (editorState.isSelecting && mode === "select") {
        updateSelection(editor, e);
      } else if (editorState.isDraggingNodes && mode === "select") {
        updateNodeDragging(editor, e);
      } else if (editorState.isRotating && mode === "select") {
        updateRotation(editor, e);
      } else if (editorState.isDrawingShape && drawingNodeId) {
        updateShapeDrawing(editor, e, drawingNodeId);
      } else if (editorState.drawingPoints && mode === "draw") {
        updatePathDrawing(editor, e);
      }
    },
    [editor, drawingNodeId]
  );

  const handleMouseUp = useCallback(() => {
    const { mode, editorState } = editor;

    // Handle shape drawing completion
    if (editorState.isDrawingShape && drawingNodeId) {
      finishShapeDrawing(editor, drawingNodeId);
      setDrawingNodeId(null);
    }

    // Handle path drawing completion
    if (editorState.drawingPoints) {
      finishPathDrawing(editor);
    }

    // Handle selection completion
    if (editorState.isSelecting) {
      finishSelection(editor);
    }

    // Handle rotation completion
    if (editorState.isRotating) {
      finishRotation(editor);
    }

    // Handle node dragging completion
    if (editorState.isDraggingNodes) {
      finishNodeDragging(editor);
    }

    // Reset all dragging states
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
  }, [editor, drawingNodeId]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
