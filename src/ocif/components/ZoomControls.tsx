import { useCanvasContext } from "../hooks/useCanvasContext";
import { Minus, Plus } from "lucide-react";

export const ZoomControls = () => {
  const { scale, setScale } = useCanvasContext();

  const handleZoomIn = () => {
    setScale(Math.min(5, scale + 0.2));
  };

  const handleZoomOut = () => {
    setScale(Math.max(0.25, scale - 0.2));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  return (
    <div className="absolute border p-1 bottom-4 right-4 flex items-center bg-background rounded-lg">
      <button
        onClick={handleZoomOut}
        className="w-8 h-8 rounded-sm flex items-center justify-center hover:bg-accent transition-colors"
        aria-label="Zoom out"
      >
        <Minus className="w-5 h-5" />
      </button>
      <button
        onClick={handleResetZoom}
        className="w-16 h-8 rounded-sm flex items-center justify-center text-sm font-medium hover:bg-accent transition-colors"
        aria-label="Reset zoom to 100%"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={handleZoomIn}
        className="w-8 h-8 rounded-sm flex items-center justify-center hover:bg-accent transition-colors"
        aria-label="Zoom in"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};
