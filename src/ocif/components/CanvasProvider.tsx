import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { CanvasContext } from "../contexts/CanvasContext";
import { useCanvas } from "../hooks/useCanvas";

interface CanvasProviderProps {
  children: ReactNode;
}

export const CanvasProvider = ({ children }: CanvasProviderProps) => {
  const {
    canvasRef,
    position,
    scale,
    setScale,
    zoomBy,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    transform,
    mode,
    setMode,
  } = useCanvas();

  return (
    <CanvasContext.Provider
      value={{
        position,
        scale,
        setScale,
        zoomBy,
        transform,
        mode,
        setMode,
      }}
    >
      <div
        ref={canvasRef}
        className={cn("relative h-full w-full overflow-hidden bg-gray-50", {
          "cursor-grab active:cursor-grabbing": mode === "hand",
          "cursor-default": mode === "select",
        })}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </div>
    </CanvasContext.Provider>
  );
};
