import { Minus, Plus } from "lucide-react";

import { useCanvasContext } from "../hooks/useCanvasContext";

export const ZoomControls = () => {
  const { scale, setScale, zoomBy } = useCanvasContext();

  return (
    <div className="absolute right-4 bottom-4 flex items-center rounded-lg border bg-background p-1">
      <button
        onClick={() => zoomBy(-0.2)}
        className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors hover:bg-accent"
        aria-label="Zoom out"
      >
        <Minus className="h-5 w-5" />
      </button>
      <button
        onClick={() => setScale(1)}
        className="flex h-8 w-16 items-center justify-center rounded-sm text-sm font-medium transition-colors hover:bg-accent"
        aria-label="Reset zoom to 100%"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={() => zoomBy(0.2)}
        className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors hover:bg-accent"
        aria-label="Zoom in"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
};
