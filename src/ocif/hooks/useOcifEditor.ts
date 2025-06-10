import { useCallback, useEffect, useRef, useState } from "react";

import { nanoid } from "nanoid";

import type { EditorMode, SelectionBounds } from "../contexts/EditorContext";
import type { OcifSchemaBase } from "../schema";
import {
  calculateScaledDelta,
  getRelativeMousePosition,
  screenToCanvasPosition,
} from "../utils/coordinates";
import {
  getPerfectPointsFromPoints,
  getSvgPathFromPoints,
} from "../utils/drawing";

interface OcifEditorState {
  position: { x: number; y: number };
  scale: number;
  isDragging: boolean;
  dragStart: { x: number; y: number };
  isSelecting: boolean;
  selectionStart: { x: number; y: number };
  isDraggingNodes: boolean;
  nodeDragStart: { x: number; y: number };
  initialNodePositions: Map<string, number[]>;
  isDrawingShape: boolean;
  shapeStart: { x: number; y: number };
  drawingPoints: Array<[number, number]> | undefined;
}

export interface UseOcifEditor {
  // Canvas state
  canvasRef: React.RefObject<HTMLDivElement | null>;
  position: { x: number; y: number };
  scale: number;
  isDraggingNodes: boolean;
  transform: string;
  drawingPoints: Array<[number, number]> | undefined;

  // Mode and selection
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  selectedNodes: Set<string>;
  setSelectedNodes: (nodes: Set<string>) => void;

  // UI state
  selectionBounds: SelectionBounds | null;
  setSelectionBounds: (bounds: SelectionBounds | null) => void;
  drawingBounds: SelectionBounds | null;
  setDrawingBounds: (bounds: SelectionBounds | null) => void;

  // Actions
  zoomBy: (delta?: number, anchor?: { x: number; y: number }) => void;

  // Document manipulation
  document: OcifSchemaBase;
  updateDocument: (updater: (doc: OcifSchemaBase) => OcifSchemaBase) => void;
  updateNodeGeometry: (
    nodeId: string,
    position: number[],
    size: number[]
  ) => void;
  createShapeNode: (bounds: SelectionBounds) => void;

  // Internal event handlers
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  startNodeDrag: (
    nodeId: string,
    e: React.MouseEvent,
    nodePositions: Map<string, number[]>
  ) => void;
}

interface UseOcifEditorOptions {
  document: OcifSchemaBase;
  onChange: (document: OcifSchemaBase) => void;
}

export const useOcifEditor = ({
  document,
  onChange,
}: UseOcifEditorOptions): UseOcifEditor => {
  const [state, setState] = useState<OcifEditorState>({
    position: { x: 0, y: 0 },
    scale: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    isSelecting: false,
    selectionStart: { x: 0, y: 0 },
    isDraggingNodes: false,
    nodeDragStart: { x: 0, y: 0 },
    initialNodePositions: new Map(),
    isDrawingShape: false,
    shapeStart: { x: 0, y: 0 },
    drawingPoints: undefined,
  });

  const [mode, setMode] = useState<EditorMode>("select");
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectionBounds, setSelectionBounds] =
    useState<SelectionBounds | null>(null);
  const [drawingBounds, setDrawingBounds] = useState<SelectionBounds | null>(
    null
  );
  const [drawingNodeId, setDrawingNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const pendingUpdatesRef = useRef<Map<string, number[]>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  const updateDocument = useCallback(
    (updater: (doc: OcifSchemaBase) => OcifSchemaBase) => {
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

  const createShapeNode = useCallback(
    (bounds: SelectionBounds) => {
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
            type: mode === "oval" ? "@ocif/node/oval" : "@ocif/node/rect",
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
    [updateDocument, mode]
  );

  const zoomBy = useCallback(
    (delta?: number, anchor?: { x: number; y: number }) => {
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
        // delta undefined means reset to 100%
        const newScale = delta
          ? Math.max(minScale, Math.min(maxScale, prev.scale + delta))
          : 1;
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
        const { x: canvasX, y: canvasY } = screenToCanvasPosition(
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

        setSelectionBounds({
          startX: canvasX,
          startY: canvasY,
          endX: canvasX,
          endY: canvasY,
        });
      } else if (mode === "rectangle" || mode === "oval") {
        const { x: canvasX, y: canvasY } = screenToCanvasPosition(
          clientX,
          clientY,
          state.position,
          state.scale
        );

        setState((prev) => ({
          ...prev,
          isDrawingShape: true,
          shapeStart: { x: canvasX, y: canvasY },
        }));

        setSelectedNodes(new Set());
        const newNodeId = nanoid();
        setDrawingNodeId(newNodeId);
        const newNode = {
          id: newNodeId,
          position: [canvasX, canvasY],
          size: [0, 0],
          data: [
            {
              type: mode === "oval" ? "@ocif/node/oval" : "@ocif/node/rect",
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
      } else if (mode === "draw") {
        const { x: canvasX, y: canvasY } = screenToCanvasPosition(
          clientX,
          clientY,
          state.position,
          state.scale
        );

        setState((prev) => ({
          ...prev,
          isDrawing: true,
          drawingPoints: [[canvasX, canvasY]],
        }));
      }
    },
    [mode, state.position, state.scale, state.isDraggingNodes, updateDocument]
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
          const { x: canvasX, y: canvasY } = screenToCanvasPosition(
            clientX,
            clientY,
            state.position,
            state.scale
          );

          setSelectionBounds({
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

        if (prev.isDrawingShape && drawingNodeId) {
          const { x: canvasX, y: canvasY } = screenToCanvasPosition(
            clientX,
            clientY,
            state.position,
            state.scale
          );

          const minX = Math.min(prev.shapeStart.x, canvasX);
          const minY = Math.min(prev.shapeStart.y, canvasY);
          const width = Math.abs(canvasX - prev.shapeStart.x);
          const height = Math.abs(canvasY - prev.shapeStart.y);

          updateNodeGeometry(drawingNodeId, [minX, minY], [width, height]);
        }

        if (prev.drawingPoints && mode === "draw") {
          const { x: canvasX, y: canvasY } = screenToCanvasPosition(
            clientX,
            clientY,
            state.position,
            state.scale
          );

          return {
            ...prev,
            drawingPoints: [...prev.drawingPoints, [canvasX, canvasY]],
          };
        }

        return prev;
      });
    },
    [mode, state.position, state.scale, updateNodeGeometry, drawingNodeId]
  );

  const handleMouseUp = useCallback(() => {
    if (state.isDrawingShape && drawingNodeId) {
      const node = document.nodes?.find((n) => n.id === drawingNodeId);
      if (
        node &&
        Array.isArray(node.size) &&
        node.size.length >= 2 &&
        Array.isArray(node.position) &&
        node.position.length >= 2
      ) {
        const width = node.size[0];
        const height = node.size[1];
        if (width < 20 || height < 20) {
          const x = node.position[0];
          const y = node.position[1];
          updateNodeGeometry(drawingNodeId, [x, y], [100, 100]);
        }
      }
      setDrawingNodeId(null);
      setMode("select");
    }

    if (state.drawingPoints) {
      const points = state.drawingPoints;
      if (points.length >= 2) {
        const perfectPoints = getPerfectPointsFromPoints(points);

        const xCoords = perfectPoints.map(([x]) => x);
        const yCoords = perfectPoints.map(([, y]) => y);
        const minX = Math.min(...xCoords);
        const minY = Math.min(...yCoords);
        const maxX = Math.max(...xCoords);
        const maxY = Math.max(...yCoords);

        const adjustedPoints = perfectPoints.map(([x, y]) => [
          x - minX,
          y - minY,
        ]);

        const path = getSvgPathFromPoints(adjustedPoints);

        const newNode = {
          id: nanoid(),
          position: [minX, minY],
          size: [maxX - minX, maxY - minY],
          data: [
            {
              type: "@ocif/node/path",
              path,
              fillColor: "#000",
            },
          ],
        };

        updateDocument((doc) => ({
          ...doc,
          nodes: [...(doc.nodes || []), newNode],
        }));
      }
    }

    setState((prev) => {
      if (prev.isSelecting && selectionBounds && document.nodes) {
        const bounds = selectionBounds;
        const minX = Math.min(bounds.startX, bounds.endX);
        const maxX = Math.max(bounds.startX, bounds.endX);
        const minY = Math.min(bounds.startY, bounds.endY);
        const maxY = Math.max(bounds.startY, bounds.endY);

        const selectedNodeIds = new Set<string>();

        for (const node of document.nodes || []) {
          if (
            !node.position ||
            node.position.length < 2 ||
            !node.size ||
            node.size.length < 2
          ) {
            continue;
          }

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

        setSelectedNodes(selectedNodeIds);
      }

      return {
        ...prev,
        isDragging: false,
        isSelecting: false,
        isDraggingNodes: false,
        isDrawingShape: false,
        drawingPoints: undefined,
        initialNodePositions: new Map(),
      };
    });

    if (mode === "select") {
      setSelectionBounds(null);
    }
  }, [
    mode,
    selectionBounds,
    state.isDrawingShape,
    state.drawingPoints,
    drawingNodeId,
    document.nodes,
    updateNodeGeometry,
    updateDocument,
  ]);

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
    isDraggingNodes: state.isDraggingNodes,
    transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.scale})`,
    drawingPoints: state.drawingPoints,

    // Mode and selection
    mode,
    setMode,
    selectedNodes,
    setSelectedNodes,

    // UI state
    selectionBounds,
    setSelectionBounds,
    drawingBounds,
    setDrawingBounds,

    // Actions
    zoomBy,

    // Document manipulation
    document,
    updateDocument,
    updateNodeGeometry,
    createShapeNode,

    // Internal event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    startNodeDrag,
  };
};
