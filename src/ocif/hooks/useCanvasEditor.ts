import { useCallback, useEffect, useRef, useState } from "react";

import { nanoid } from "nanoid";

import type { CanvasMode } from "../actions/types";
import type { SelectionRectangle } from "../contexts/CanvasContext";
import type { OcifDocument } from "../schema";
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
  isDrawingRectangle: boolean;
  rectangleStart: { x: number; y: number };
}

export interface CanvasEditor {
  // Canvas state
  canvasRef: React.RefObject<HTMLDivElement | null>;
  position: { x: number; y: number };
  scale: number;
  transform: string;

  // Mode and selection
  mode: CanvasMode;
  setMode: (mode: CanvasMode) => void;
  selectedNodes: Set<string>;
  setSelectedNodes: (nodes: Set<string>) => void;

  // UI state
  selectionRectangle: SelectionRectangle | null;
  setSelectionRectangle: (rect: SelectionRectangle | null) => void;
  drawingRectangle: SelectionRectangle | null;
  setDrawingRectangle: (rect: SelectionRectangle | null) => void;

  // Actions
  setScale: (newScale: number) => void;
  zoomBy: (delta: number, anchor?: { x: number; y: number }) => void;

  // Document manipulation
  document: OcifDocument;
  updateDocument: (updater: (doc: OcifDocument) => OcifDocument) => void;
  updateNodeGeometry: (
    nodeId: string,
    position: number[],
    size: number[]
  ) => void;
  createRectangleNode: (bounds: SelectionRectangle) => void;

  // Internal event handlers (used by DocumentCanvas)
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (
    nodes?: Array<{ id: string; position: number[]; size: number[] }>
  ) => void;
  startNodeDrag: (
    nodeId: string,
    e: React.MouseEvent,
    nodePositions: Map<string, number[]>
  ) => void;
  isDraggingNodes: boolean;
}

interface UseCanvasEditorOptions {
  document: OcifDocument;
  onChange: (document: OcifDocument) => void;
}

export const useCanvasEditor = ({
  document,
  onChange,
}: UseCanvasEditorOptions): CanvasEditor => {
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
    isDrawingRectangle: false,
    rectangleStart: { x: 0, y: 0 },
  });

  const [mode, setMode] = useState<CanvasMode>("select");
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectionRectangle, setSelectionRectangle] =
    useState<SelectionRectangle | null>(null);
  const [drawingRectangle, setDrawingRectangle] =
    useState<SelectionRectangle | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const pendingUpdatesRef = useRef<Map<string, number[]>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  const updateDocument = useCallback(
    (updater: (doc: OcifDocument) => OcifDocument) => {
      onChange(updater(document));
    },
    [document, onChange]
  );

  const updateNodeGeometry = useCallback(
    (nodeId: string, position: number[], size: number[]) => {
      // Batch updates using requestAnimationFrame for performance
      pendingUpdatesRef.current.set(nodeId, [...position, ...size]);

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingUpdatesRef.current.size > 0) {
          const updates = new Map(pendingUpdatesRef.current);
          pendingUpdatesRef.current.clear();
          rafIdRef.current = null;

          updateDocument((doc) => ({
            ...doc,
            nodes: doc.nodes?.map((node) => {
              const update = updates.get(node.id);
              if (update) {
                const [x, y, w, h] = update;
                return {
                  ...node,
                  position: [x, y],
                  ...(w !== undefined && h !== undefined
                    ? { size: [w, h] }
                    : {}),
                };
              }
              return node;
            }),
          }));
        }
      });
    },
    [updateDocument]
  );

  const createRectangleNode = useCallback(
    (bounds: SelectionRectangle) => {
      const minX = Math.min(bounds.startX, bounds.endX);
      const minY = Math.min(bounds.startY, bounds.endY);
      const width = Math.abs(bounds.endX - bounds.startX);
      const height = Math.abs(bounds.endY - bounds.startY);

      const newNode = {
        id: nanoid(),
        position: [minX, minY],
        size: [width, height],
        data: [
          {
            type: "@ocif/node/rect",
            strokeWidth: 2,
            strokeColor: "#000",
            fillColor: "#fff",
          },
        ],
      };

      updateDocument((doc) => ({
        ...doc,
        nodes: [...(doc.nodes || []), newNode],
      }));
    },
    [updateDocument]
  );

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

        const pointX = (anchorX - prev.position.x) / prev.scale;
        const pointY = (anchorY - prev.position.y) / prev.scale;

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
      } else if (mode === "rectangle") {
        const { x: canvasX, y: canvasY } = screenToCanvas(
          clientX,
          clientY,
          state.position,
          state.scale
        );

        setState((prev) => ({
          ...prev,
          isDrawingRectangle: true,
          rectangleStart: { x: canvasX, y: canvasY },
        }));

        setDrawingRectangle({
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

          prev.initialNodePositions.forEach((initialPos, nodeId) => {
            if (initialPos.length >= 2) {
              const newPosition = [
                initialPos[0] + deltaX,
                initialPos[1] + deltaY,
              ];
              updateNodeGeometry(nodeId, newPosition, []);
            }
          });
        }

        if (prev.isDrawingRectangle && mode === "rectangle") {
          const { x: canvasX, y: canvasY } = screenToCanvas(
            clientX,
            clientY,
            state.position,
            state.scale
          );

          setDrawingRectangle({
            startX: prev.rectangleStart.x,
            startY: prev.rectangleStart.y,
            endX: canvasX,
            endY: canvasY,
          });
        }

        return prev;
      });
    },
    [mode, state.position, state.scale, updateNodeGeometry]
  );

  const handleMouseUp = useCallback(
    (nodes?: Array<{ id: string; position: number[]; size: number[] }>) => {
      // Handle rectangle creation BEFORE setState to prevent multiple calls
      if (state.isDrawingRectangle && drawingRectangle) {
        const width = Math.abs(drawingRectangle.endX - drawingRectangle.startX);
        const height = Math.abs(
          drawingRectangle.endY - drawingRectangle.startY
        );

        if (width > 20 && height > 20) {
          createRectangleNode(drawingRectangle);
        }

        setDrawingRectangle(null);
      }

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
          isDrawingRectangle: false,
          initialNodePositions: new Map(),
        };
      });

      if (mode === "select") {
        setSelectionRectangle(null);
      }
    },
    [
      mode,
      selectionRectangle,
      drawingRectangle,
      createRectangleNode,
      state.isDrawingRectangle,
    ]
  );

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

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return {
    // Canvas state
    canvasRef,
    position: state.position,
    scale: state.scale,
    transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.scale})`,

    // Mode and selection
    mode,
    setMode,
    selectedNodes,
    setSelectedNodes,

    // UI state
    selectionRectangle,
    setSelectionRectangle,
    drawingRectangle,
    setDrawingRectangle,

    // Actions
    setScale,
    zoomBy,

    // Document manipulation
    document,
    updateDocument,
    updateNodeGeometry,
    createRectangleNode,

    // Internal event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    startNodeDrag,
    isDraggingNodes: state.isDraggingNodes,
  };
};
