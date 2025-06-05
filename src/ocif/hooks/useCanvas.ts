import { useCallback, useEffect, useRef, useState } from "react";

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
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  transform: string;
}

export const useCanvas = (): UseCanvasReturn => {
  const [state, setState] = useState<CanvasState>({
    position: { x: 0, y: 0 },
    scale: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
  });

  const canvasRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  const setScale = useCallback(
    (newScale: number) => {
      const container = canvasRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate the point under the center relative to the current transform
      const pointX = (centerX - state.position.x) / state.scale;
      const pointY = (centerY - state.position.y) / state.scale;

      // Calculate new position to keep the center point in the same place
      const newPosition = {
        x: centerX - pointX * newScale,
        y: centerY - pointY * newScale,
      };

      setState((prev) => ({
        ...prev,
        scale: Math.max(0.25, Math.min(5, newScale)),
        position: newPosition,
      }));
    },
    [state.position, state.scale]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setState((prev) => ({
      ...prev,
      isDragging: true,
      dragStart: {
        x: e.clientX - prev.position.x,
        y: e.clientY - prev.position.y,
      },
    }));
  }, []);

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

      // Calculate the mouse position relative to the current transform
      const pointX = (mouseX - state.position.x) / state.scale;
      const pointY = (mouseY - state.position.y) / state.scale;

      const delta = -e.deltaY;
      const zoomFactor = 0.002;
      const newScale = Math.max(
        0.25,
        Math.min(5, state.scale + delta * zoomFactor)
      );

      // Calculate new position to keep the point under mouse cursor in the same place
      const newPosition = {
        x: mouseX - pointX * newScale,
        y: mouseY - pointY * newScale,
      };

      setState((prev) => ({
        ...prev,
        scale: newScale,
        position: newPosition,
      }));
    },
    [state.position, state.scale]
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
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.scale})`,
  };
};
