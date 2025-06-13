import type { UseOcifEditor } from "../hooks/useOcifEditor";
import {
  calculateScaledDelta,
  getRelativeMousePosition,
} from "../utils/coordinates";

// Node dragging actions
export const updateNodeDragging = (
  editor: UseOcifEditor,
  e: React.MouseEvent
) => {
  const container = editor.canvasRef.current;
  if (!container) return;

  const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);

  editor.setEditorState((prev) => {
    if (!prev.isDraggingNodes) return prev;

    const { deltaX, deltaY } = calculateScaledDelta(
      prev.nodeDragStart,
      { x: clientX, y: clientY },
      editor.editorState.scale
    );

    prev.initialNodePositions.forEach((initialPos, nodeId) => {
      if (initialPos.length >= 2) {
        const newPosition = [initialPos[0] + deltaX, initialPos[1] + deltaY];
        editor.updateNodeProperties(nodeId, { position: newPosition });
      }
    });

    return prev;
  });
};

export const finishNodeDragging = (editor: UseOcifEditor) => {
  editor.setEditorState((prev) => ({
    ...prev,
    isDraggingNodes: false,
    nodeDragStart: { x: 0, y: 0 },
    initialNodePositions: new Map(),
  }));
};
