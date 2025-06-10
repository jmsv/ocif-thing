import type { UseOcifEditor } from "../hooks/useOcifEditor";
import { canvasToScreenPosition } from "../utils/coordinates";

export const SelectionPreview = ({ editor }: { editor: UseOcifEditor }) => {
  if (!editor.selectionBounds) return null;

  const { x: left, y: top } = canvasToScreenPosition(
    Math.min(editor.selectionBounds.startX, editor.selectionBounds.endX),
    Math.min(editor.selectionBounds.startY, editor.selectionBounds.endY),
    editor.position,
    editor.scale
  );

  const width =
    Math.abs(editor.selectionBounds.endX - editor.selectionBounds.startX) *
    editor.scale;

  const height =
    Math.abs(editor.selectionBounds.endY - editor.selectionBounds.startY) *
    editor.scale;

  return (
    <div
      className="ocif-selection-preview"
      style={{ left, top, width, height }}
    />
  );
};
