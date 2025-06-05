import { Hand, MousePointer2 } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

import { useCanvasContext } from "../hooks/useCanvasContext";

export const Toolbar = () => {
  const { mode, setMode } = useCanvasContext();

  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-background p-1">
      <Toggle
        pressed={mode === "select"}
        onPressedChange={(pressed) => {
          if (pressed) setMode("select");
        }}
        aria-label="Select mode"
      >
        <MousePointer2 className="size-4" />
      </Toggle>

      <Toggle
        pressed={mode === "hand"}
        onPressedChange={(pressed) => {
          if (pressed) setMode("hand");
        }}
        aria-label="Hand mode"
      >
        <Hand className="size-4" />
      </Toggle>
    </div>
  );
};
