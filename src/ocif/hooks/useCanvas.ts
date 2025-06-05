import { useCallback, useEffect, useRef, useState } from "react";

import type { CanvasMode } from "../contexts/CanvasContext";

interface CanvasState {
  position: { x: number; y: number };
  scale: number;
  isDragging: boolean;
  dragStart: { x: number; y: number };
}

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number };
  scale: number;
  setScale: (newScale: number) => void;
  zoomBy: (delta: number, anchor?: { x: number; y: number }) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  transform: string;
  mode: CanvasMode;
  setMode: (mode: CanvasMode) => void;
}

export const useCanvas = (): UseCanvasReturn => {
  const [state, setState] = useState<CanvasState>({
    position: { x: 0, y: 0 },
    scale: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
  });

  const [mode, setMode] = useState<CanvasMode>("select");

  const canvasRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  const setScale = useCallback((newScale: number) => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(0.2, Math.min(5, newScale)),
    }));
  }, []);

  const zoomBy = useCallback(
    (delta: number, anchor?: { x: number; y: number }) => {
      const container = canvasRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      let anchorX = rect.width / 2;
      let anchorY = rect.height / 2;
      if (anchor) {
        anchorX = anchor.x;
        anchorY = anchor.y;
      }

      setState((prev) => {
        const minScale = 0.2;
        const maxScale = 5;
        const newScale = Math.max(
          minScale,
          Math.min(maxScale, prev.scale + delta)
        );
        if (newScale === prev.scale) return prev;

        // Calculate the point under the anchor relative to the current transform
        const pointX = (anchorX - prev.position.x) / prev.scale;
        const pointY = (anchorY - prev.position.y) / prev.scale;

        // Calculate new position to keep the anchor point in the same place
        const newPosition = {
          x: anchorX - pointX * newScale,
          y: anchorY - pointY * newScale,
        };

        return {
          ...prev,
          scale: newScale,
          position: newPosition,
        };
      });
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== "hand") return;
      setState((prev) => ({
        ...prev,
        isDragging: true,
        dragStart: {
          x: e.clientX - prev.position.x,
          y: e.clientY - prev.position.y,
        },
      }));
    },
    [mode]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setState((prev) => {
      if (!prev.isDragging) return prev;

      return {
        ...prev,
        position: {
          x: e.clientX - prev.dragStart.x,
          y: e.clientY - prev.dragStart.y,
        },
      };
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
    }));
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const container = canvasRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = -e.deltaY * 0.002;
      zoomBy(delta, { x: mouseX, y: mouseY });
    },
    [zoomBy]
  );

  useEffect(() => {
    const container = canvasRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleWheel]);

  return {
    canvasRef,
    position: state.position,
    scale: state.scale,
    setScale,
    zoomBy,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.scale})`,
    mode,
    setMode,
  };
};
