import {
  Circle,
  Hand,
  type LucideIcon,
  MousePointer2,
  Pencil,
  Square,
} from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

import type { UseOcifEditor } from "../hooks/useOcifEditor";

interface ToolbarProps {
  editor: UseOcifEditor;
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  const { mode, setMode } = editor;

  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-background p-1">
      <ToggleButton
        pressed={mode === "select"}
        onSetMode={() => setMode("select")}
        ariaLabel="Select mode"
        shortcutKey="v"
        icon={MousePointer2}
      />

      <ToggleButton
        pressed={mode === "hand"}
        onSetMode={() => setMode("hand")}
        ariaLabel="Hand mode"
        shortcutKey="h"
        icon={Hand}
      />

      <ToggleButton
        pressed={mode === "rectangle"}
        onSetMode={() => setMode("rectangle")}
        ariaLabel="Rectangle mode"
        shortcutKey="r"
        icon={Square}
      />

      <ToggleButton
        pressed={mode === "oval"}
        onSetMode={() => setMode("oval")}
        ariaLabel="Oval mode"
        shortcutKey="o"
        icon={Circle}
      />

      <ToggleButton
        pressed={mode === "draw"}
        onSetMode={() => setMode("draw")}
        ariaLabel="Draw mode"
        shortcutKey="d"
        icon={Pencil}
      />
    </div>
  );
};

const ToggleButton = ({
  pressed,
  onSetMode,
  ariaLabel,
  shortcutKey,
  icon: Icon,
}: {
  pressed: boolean;
  onSetMode: () => void;
  ariaLabel: string;
  shortcutKey: string;
  icon: LucideIcon;
}) => {
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={(pressed) => {
        if (pressed) onSetMode();
      }}
      aria-label={ariaLabel}
      className="relative"
    >
      <div className="absolute right-1 bottom-0.5 text-[8px] font-bold uppercase opacity-30">
        {shortcutKey}
      </div>
      <Icon className="size-4" />
    </Toggle>
  );
};
