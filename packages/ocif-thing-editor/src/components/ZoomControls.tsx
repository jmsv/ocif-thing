import { MinusIcon, PlusIcon } from "lucide-react";

import type { UseOcifEditor } from "../hooks/useOcifEditor";

export const ZoomControls = ({ editor }: { editor: UseOcifEditor }) => {
  return (
    <div className="ocif-zoom-controls">
      <button
        className="ocif-zoom-button"
        onClick={() => editor.zoomBy(-0.2)}
        aria-label="Zoom out"
      >
        <MinusIcon />
      </button>

      <button
        onClick={() => editor.zoomBy()}
        className="ocif-zoom-button ocif-zoom-button-center"
        aria-label="Reset zoom to 100%"
      >
        {Math.round(editor.scale * 100)}%
      </button>

      <button
        className="ocif-zoom-button"
        onClick={() => editor.zoomBy(0.2)}
        aria-label="Zoom in"
      >
        <PlusIcon />
      </button>
    </div>
  );
};
