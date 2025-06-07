import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { UseOcifEditor } from "../hooks/useOcifEditor";

export const ZoomControls = ({ editor }: { editor: UseOcifEditor }) => {
  return (
    <div className="absolute right-4 bottom-4 flex items-center rounded-lg border bg-background p-1 select-none">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.zoomBy(-0.2)}
        aria-label="Zoom out"
      >
        <Minus className="size-4" />
      </Button>

      <Button
        size="md"
        variant="ghost"
        onClick={() => editor.setScale(1)}
        aria-label="Reset zoom to 100%"
        className="w-14 px-0"
      >
        {Math.round(editor.scale * 100)}%
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.zoomBy(0.2)}
        aria-label="Zoom in"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
};
