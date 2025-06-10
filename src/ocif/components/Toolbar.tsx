import * as Toggle from "@radix-ui/react-toggle";
import clsx from "clsx";
import {
  Circle,
  Hand,
  type LucideIcon,
  MousePointer2,
  Pencil,
  Square,
} from "lucide-react";

import type { UseOcifEditor } from "../hooks/useOcifEditor";

interface ToolbarProps {
  editor: UseOcifEditor;
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  const { mode, setMode } = editor;

  return (
    <div className="ocif-toolbar">
      <ToolbarButton
        pressed={mode === "select"}
        onSetMode={() => setMode("select")}
        ariaLabel="Select mode"
        shortcutKey="v"
        icon={MousePointer2}
      />

      <ToolbarButton
        pressed={mode === "hand"}
        onSetMode={() => setMode("hand")}
        ariaLabel="Hand mode"
        shortcutKey="h"
        icon={Hand}
      />

      <ToolbarButton
        pressed={mode === "rectangle"}
        onSetMode={() => setMode("rectangle")}
        ariaLabel="Rectangle mode"
        shortcutKey="r"
        icon={Square}
      />

      <ToolbarButton
        pressed={mode === "oval"}
        onSetMode={() => setMode("oval")}
        ariaLabel="Oval mode"
        shortcutKey="o"
        icon={Circle}
      />

      <ToolbarButton
        pressed={mode === "draw"}
        onSetMode={() => setMode("draw")}
        ariaLabel="Draw mode"
        shortcutKey="d"
        icon={Pencil}
      />
    </div>
  );
};

const ToolbarButton = ({
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
    <Toggle.Root
      pressed={pressed}
      onPressedChange={(pressed) => {
        if (pressed) onSetMode();
      }}
      aria-label={ariaLabel}
      className={clsx("ocif-toolbar-button", {
        "ocif-toolbar-button-pressed": pressed,
      })}
    >
      <div className="absolute right-1 bottom-0.5 text-[8px] font-bold uppercase opacity-30">
        {shortcutKey}
      </div>
      <Icon />
    </Toggle.Root>
  );
};
