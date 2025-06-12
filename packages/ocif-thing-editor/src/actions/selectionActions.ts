import type { UseOcifEditor } from "../hooks/useOcifEditor";
import {
  getRelativeMousePosition,
  screenToCanvasPosition,
} from "../utils/coordinates";

// Selection actions
export const startSelection = (editor: UseOcifEditor, e: React.MouseEvent) => {
  const container = editor.canvasRef.current;
  if (!container) return;

  const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);
  const { x: canvasX, y: canvasY } = screenToCanvasPosition(
    clientX,
    clientY,
    editor.editorState.position,
    editor.editorState.scale
  );

  editor.setEditorState((prev) => ({
    ...prev,
    isSelecting: true,
    selectionStart: { x: canvasX, y: canvasY },
  }));

  editor.setSelectionBounds({
    startX: canvasX,
    startY: canvasY,
    endX: canvasX,
    endY: canvasY,
  });
};

export const updateSelection = (editor: UseOcifEditor, e: React.MouseEvent) => {
  const container = editor.canvasRef.current;
  if (!container) return;

  const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);
  const { x: canvasX, y: canvasY } = screenToCanvasPosition(
    clientX,
    clientY,
    editor.editorState.position,
    editor.editorState.scale
  );

  editor.setEditorState((prev) => {
    if (!prev.isSelecting) return prev;

    editor.setSelectionBounds({
      startX: prev.selectionStart.x,
      startY: prev.selectionStart.y,
      endX: canvasX,
      endY: canvasY,
    });

    return prev;
  });
};

export const finishSelection = (editor: UseOcifEditor) => {
  editor.setEditorState((prev) => {
    if (prev.isSelecting && editor.selectionBounds && editor.document.nodes) {
      const bounds = editor.selectionBounds;
      const minX = Math.min(bounds.startX, bounds.endX);
      const maxX = Math.max(bounds.startX, bounds.endX);
      const minY = Math.min(bounds.startY, bounds.endY);
      const maxY = Math.max(bounds.startY, bounds.endY);

      const selectedNodeIds = new Set<string>();

      for (const node of editor.document.nodes || []) {
        if (
          !node.position ||
          node.position.length < 2 ||
          !node.size ||
          node.size.length < 2
        ) {
          continue;
        }

        const nodeLeft = node.position[0];
        const nodeTop = node.position[1];
        const nodeRight = nodeLeft + node.size[0];
        const nodeBottom = nodeTop + node.size[1];

        if (
          nodeLeft < maxX &&
          nodeRight > minX &&
          nodeTop < maxY &&
          nodeBottom > minY
        ) {
          selectedNodeIds.add(node.id);
        }
      }

      editor.setSelectedNodes(selectedNodeIds);
    }

    return {
      ...prev,
      isSelecting: false,
      selectionStart: { x: 0, y: 0 },
    };
  });

  editor.setSelectionBounds(null);
};
