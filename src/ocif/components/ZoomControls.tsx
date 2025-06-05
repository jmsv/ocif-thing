import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCanvasContext } from "../hooks/useCanvasContext";

export const ZoomControls = () => {
  const { scale, setScale, zoomBy } = useCanvasContext();

  return (
    <div className="absolute right-4 bottom-4 flex items-center rounded-lg border bg-background p-1 select-none">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => zoomBy(-0.2)}
        aria-label="Zoom out"
      >
        <Minus className="size-4" />
      </Button>

      <Button
        size="md"
        variant="ghost"
        onClick={() => setScale(1)}
        aria-label="Reset zoom to 100%"
        className="w-14 px-0"
      >
        {Math.round(scale * 100)}%
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => zoomBy(0.2)}
        aria-label="Zoom in"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
};
