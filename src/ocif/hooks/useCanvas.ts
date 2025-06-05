import { useCallback, useEffect, useRef, useState } from "react";

import type { CanvasMode, SelectionRectangle } from "../contexts/CanvasContext";
import {
  calculateScaledDelta,
  getRelativeMousePosition,
  screenToCanvas,
} from "../utils/coordinates";

interface CanvasState {
  position: { x: number; y: number };
  scale: number;
  isDragging: boolean;
  dragStart: { x: number; y: number };
  isSelecting: boolean;
  selectionStart: { x: number; y: number };
  isDraggingNodes: boolean;
  nodeDragStart: { x: number; y: number };
  initialNodePositions: Map<string, number[]>;
}

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number };
  scale: number;
  setScale: (newScale: number) => void;
  zoomBy: (delta: number, anchor?: { x: number; y: number }) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (
    nodes?: Array<{ id: string; position: number[]; size: number[] }>
  ) => void;
  transform: string;
  mode: CanvasMode;
  setMode: (mode: CanvasMode) => void;
  selectedNodes: Set<string>;
  setSelectedNodes: (nodes: Set<string>) => void;
  selectionRectangle: SelectionRectangle | null;
  setSelectionRectangle: (rect: SelectionRectangle | null) => void;
  startNodeDrag: (
    nodeId: string,
    e: React.MouseEvent,
    nodePositions: Map<string, number[]>
  ) => void;
  isDraggingNodes: boolean;
}

export const useCanvas = (
  onNodeDrag?: (nodeId: string, position: number[]) => void
): UseCanvasReturn => {
  const [state, setState] = useState<CanvasState>({
    position: { x: 0, y: 0 },
    scale: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    isSelecting: false,
    selectionStart: { x: 0, y: 0 },
    isDraggingNodes: false,
    nodeDragStart: { x: 0, y: 0 },
    initialNodePositions: new Map(),
  });

  const [mode, setMode] = useState<CanvasMode>("select");
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectionRectangle, setSelectionRectangle] =
    useState<SelectionRectangle | null>(null);

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
      const container = canvasRef.current;
      if (!container) return;

      const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);

      if (mode === "hand") {
        setState((prev) => ({
          ...prev,
          isDragging: true,
          dragStart: {
            x: e.clientX - prev.position.x,
            y: e.clientY - prev.position.y,
          },
        }));
      } else if (mode === "select" && !state.isDraggingNodes) {
        const { x: canvasX, y: canvasY } = screenToCanvas(
          clientX,
          clientY,
          state.position,
          state.scale
        );

        setState((prev) => ({
          ...prev,
          isSelecting: true,
          selectionStart: { x: canvasX, y: canvasY },
        }));

        setSelectionRectangle({
          startX: canvasX,
          startY: canvasY,
          endX: canvasX,
          endY: canvasY,
        });
      }
    },
    [mode, state.position, state.scale, state.isDraggingNodes]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const container = canvasRef.current;
      if (!container) return;

      const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);

      setState((prev) => {
        if (prev.isDragging && mode === "hand") {
          return {
            ...prev,
            position: {
              x: e.clientX - prev.dragStart.x,
              y: e.clientY - prev.dragStart.y,
            },
          };
        }

        if (prev.isSelecting && mode === "select") {
          const { x: canvasX, y: canvasY } = screenToCanvas(
            clientX,
            clientY,
            state.position,
            state.scale
          );

          setSelectionRectangle({
            startX: prev.selectionStart.x,
            startY: prev.selectionStart.y,
            endX: canvasX,
            endY: canvasY,
          });
        }

        if (prev.isDraggingNodes && mode === "select") {
          const { deltaX, deltaY } = calculateScaledDelta(
            prev.nodeDragStart,
            { x: clientX, y: clientY },
            state.scale
          );

          // Apply delta to all nodes that are being dragged
          prev.initialNodePositions.forEach((initialPos, nodeId) => {
            if (initialPos.length >= 2) {
              const newPosition = [
                initialPos[0] + deltaX,
                initialPos[1] + deltaY,
              ];
              if (onNodeDrag) {
                onNodeDrag(nodeId, newPosition);
              }
            }
          });
        }

        return prev;
      });
    },
    [mode, state.position, state.scale, onNodeDrag]
  );

  const handleMouseUp = useCallback(
    (nodes?: Array<{ id: string; position: number[]; size: number[] }>) => {
      setState((prev) => {
        if (prev.isSelecting && selectionRectangle && nodes) {
          const rect = selectionRectangle;
          const minX = Math.min(rect.startX, rect.endX);
          const maxX = Math.max(rect.startX, rect.endX);
          const minY = Math.min(rect.startY, rect.endY);
          const maxY = Math.max(rect.startY, rect.endY);

          const selectedNodeIds = new Set<string>();

          nodes.forEach((node) => {
            if (node.position.length >= 2 && node.size.length >= 2) {
              const nodeLeft = node.position[0];
              const nodeTop = node.position[1];
              const nodeRight = nodeLeft + node.size[0];
              const nodeBottom = nodeTop + node.size[1];

              // Check if rectangles intersect
              if (
                nodeLeft < maxX &&
                nodeRight > minX &&
                nodeTop < maxY &&
                nodeBottom > minY
              ) {
                selectedNodeIds.add(node.id);
              }
            }
          });

          setSelectedNodes(selectedNodeIds);
        }

        return {
          ...prev,
          isDragging: false,
          isSelecting: false,
          isDraggingNodes: false,
          initialNodePositions: new Map(),
        };
      });

      if (mode === "select") {
        setSelectionRectangle(null);
      }
    },
    [mode, selectionRectangle]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const container = canvasRef.current;
      if (!container) return;

      const { x: mouseX, y: mouseY } = getRelativeMousePosition(e, container);
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

  const startNodeDrag = useCallback(
    (
      _nodeId: string,
      e: React.MouseEvent,
      nodePositions: Map<string, number[]>
    ) => {
      const container = canvasRef.current;
      if (!container) return;

      const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);

      setState((prev) => ({
        ...prev,
        isDraggingNodes: true,
        nodeDragStart: { x: clientX, y: clientY },
        initialNodePositions: nodePositions,
      }));
    },
    []
  );

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
    selectedNodes,
    setSelectedNodes,
    selectionRectangle,
    setSelectionRectangle,
    startNodeDrag,
    isDraggingNodes: state.isDraggingNodes,
  };
};
