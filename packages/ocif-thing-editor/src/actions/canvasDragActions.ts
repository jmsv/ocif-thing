import type { UseOcifEditor } from "../hooks/useOcifEditor";

// Canvas drag actions (hand tool)
export const startCanvasDrag = (editor: UseOcifEditor, e: React.MouseEvent) => {
  editor.setEditorState((prev) => ({
    ...prev,
    isDragging: true,
    dragStart: {
      x: e.clientX - prev.position.x,
      y: e.clientY - prev.position.y,
    },
  }));
};

export const updateCanvasDrag = (
  editor: UseOcifEditor,
  e: React.MouseEvent
) => {
  editor.setEditorState((prev) => {
    if (!prev.isDragging) return prev;
    return {
      ...prev,
      position: {
        x: e.clientX - prev.dragStart.x,
        y: e.clientY - prev.dragStart.y,
      },
    };
  });
};
