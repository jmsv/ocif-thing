import { Circle, Hand, MousePointer2, Square } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

import type { UseOcifEditor } from "../hooks/useOcifEditor";

interface ToolbarProps {
  editor: UseOcifEditor;
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  const { mode, setMode } = editor;

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

      <Toggle
        pressed={mode === "rectangle"}
        onPressedChange={(pressed) => {
          if (pressed) setMode("rectangle");
        }}
        aria-label="Rectangle mode"
      >
        <Square className="size-4" />
      </Toggle>

      <Toggle
        pressed={mode === "oval"}
        onPressedChange={(pressed) => {
          if (pressed) setMode("oval");
        }}
        aria-label="Oval mode"
      >
        <Circle className="size-4" />
      </Toggle>
    </div>
  );
};
