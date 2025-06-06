import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import {
  CanvasContext,
  type SelectionRectangle,
} from "../contexts/CanvasContext";
import { useCanvas } from "../hooks/useCanvas";

interface CanvasProviderProps {
  children: ReactNode;
  document?: {
    nodes?: Array<{ id: string; position?: number[]; size?: number[] }>;
  };
  onUpdateNodeGeometry?: (
    nodeId: string,
    position: number[],
    size: number[]
  ) => void;
  onCreateRectangleNode?: (bounds: SelectionRectangle) => void;
}

export const CanvasProvider = ({
  children,
  document,
  onUpdateNodeGeometry,
  onCreateRectangleNode,
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
    drawingRectangle,
    setDrawingRectangle,
    createRectangleNode,
  } = useCanvas(handleNodeDrag, onCreateRectangleNode);

  const handleMouseUpWithNodes = useCallback(() => {
    const nodes =
      document?.nodes?.map((node) => ({
        id: node.id,
        position: node.position || [0, 0],
        size: node.size || [0, 0],
      })) || [];
    handleMouseUp(nodes);
  }, [document?.nodes, handleMouseUp]);

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
        drawingRectangle,
        setDrawingRectangle,
        createRectangleNode,
      }}
    >
      <div
        ref={canvasRef}
        className={cn("relative h-full w-full overflow-hidden bg-gray-50", {
          "cursor-grab active:cursor-grabbing": mode === "hand",
          "cursor-default": mode === "select",
          "cursor-crosshair": mode === "rectangle",
        })}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpWithNodes}
        onMouseLeave={handleMouseUpWithNodes}
      >
        {children}
      </div>
    </CanvasContext.Provider>
  );
};
