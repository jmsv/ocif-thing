import type { UseOcifEditor } from "../hooks/useOcifEditor";

export const SelectionPreview = ({ editor }: { editor: UseOcifEditor }) => {
  if (!editor.selectionBounds) return null;

  return (
    <div
      className="ocif-selection-preview"
      style={{
        left: Math.min(
          editor.selectionBounds.startX,
          editor.selectionBounds.endX
        ),
        top: Math.min(
          editor.selectionBounds.startY,
          editor.selectionBounds.endY
        ),
        width: Math.abs(
          editor.selectionBounds.endX - editor.selectionBounds.startX
        ),
        height: Math.abs(
          editor.selectionBounds.endY - editor.selectionBounds.startY
        ),
      }}
    />
  );
};
