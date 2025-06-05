import type { ReactNode } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { CanvasContext } from "../contexts/CanvasContext";

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
        className="w-full h-full relative bg-gray-50 overflow-hidden"
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
