import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { CanvasContext } from "../contexts/CanvasContext";
import { useCanvas } from "../hooks/useCanvas";

interface CanvasProviderProps {
  children: ReactNode;
  onUpdateNodeGeometry?: (
    nodeId: string,
    position: number[],
    size: number[]
  ) => void;
}

export const CanvasProvider = ({
  children,
  onUpdateNodeGeometry,
}: CanvasProviderProps) => {
  const pendingUpdatesRef = useRef<Map<string, number[]>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  const handleNodeDrag = useCallback(
    (nodeId: string, position: number[]) => {
      pendingUpdatesRef.current.set(nodeId, position);

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingUpdatesRef.current.size > 0 && onUpdateNodeGeometry) {
          const updates = new Map(pendingUpdatesRef.current);
          pendingUpdatesRef.current.clear();
          rafIdRef.current = null;

          updates.forEach((position, nodeId) => {
            onUpdateNodeGeometry(nodeId, position, []);
          });
        }
      });
    },
    [onUpdateNodeGeometry]
  );

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

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
    selectedNodes,
    setSelectedNodes,
    selectionRectangle,
    setSelectionRectangle,
    startNodeDrag,
    isDraggingNodes,
  } = useCanvas(handleNodeDrag);

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
        selectedNodes,
        setSelectedNodes,
        selectionRectangle,
        setSelectionRectangle,
        handleMouseUp,
        startNodeDrag,
        isDraggingNodes,
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
        onMouseUp={() => handleMouseUp()}
        onMouseLeave={() => handleMouseUp()}
      >
        {children}
      </div>
    </CanvasContext.Provider>
  );
};
