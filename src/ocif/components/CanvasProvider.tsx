import type { ReactNode } from "react";

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
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    transform,
  } = useCanvas();

  return (
    <CanvasContext.Provider
      value={{
        position,
        scale,
        setScale,
        transform,
      }}
    >
      <div
        ref={canvasRef}
        className="relative h-full w-full overflow-hidden bg-gray-50"
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
