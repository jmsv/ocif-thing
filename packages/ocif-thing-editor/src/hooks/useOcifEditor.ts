import { useCallback, useEffect, useRef, useState } from "react";

import type { OcifSchemaBase } from "ocif-thing-schema";

import type { EditorMode, SelectionBounds } from "../contexts/EditorContext";
import { getRelativeMousePosition } from "../utils/coordinates";
import { generateId } from "../utils/generateId";

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
  isRotating: boolean;
  rotationStart: { x: number; y: number };
  rotationCenter: { x: number; y: number };
  initialRotationAngle: number;
  initialNodeStates: Map<string, { position: number[]; rotation: number }>;
}

export interface UseOcifEditor {
  // Canvas state
  canvasRef: React.RefObject<HTMLDivElement | null>;
  position: { x: number; y: number };
  scale: number;
  isDraggingNodes: boolean;
  isRotating: boolean;
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

  // Editor state management
  editorState: OcifEditorState;
  setEditorState: React.Dispatch<React.SetStateAction<OcifEditorState>>;

  // Actions
  zoomBy: (delta?: number, anchor?: { x: number; y: number }) => void;

  // Document manipulation
  document: OcifSchemaBase;
  updateDocument: (updater: (doc: OcifSchemaBase) => OcifSchemaBase) => void;
  updateNodeProperties: (
    nodeId: string,
    properties: {
      position?: number[];
      size?: number[];
      rotation?: number;
    }
  ) => void;
  createShapeNode: (bounds: SelectionBounds) => void;

  // Internal event handlers
  startNodeDrag: (
    nodeId: string,
    e: React.MouseEvent,
    nodePositions: Map<string, number[]>
  ) => void;
  startRotation: (
    e: React.MouseEvent,
    centerX: number,
    centerY: number
  ) => void;
}

interface UseOcifEditorOptions {
  value: OcifSchemaBase;
  onChange: (document: OcifSchemaBase) => void;
}

export const useOcifEditor = ({
  value: document,
  onChange,
}: UseOcifEditorOptions): UseOcifEditor => {
  const [editorState, setEditorState] = useState<OcifEditorState>({
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
    isRotating: false,
    rotationStart: { x: 0, y: 0 },
    rotationCenter: { x: 0, y: 0 },
    initialRotationAngle: 0,
    initialNodeStates: new Map(),
  });

  const [mode, setMode] = useState<EditorMode>("select");
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectionBounds, setSelectionBounds] =
    useState<SelectionBounds | null>(null);
  const [drawingBounds, setDrawingBounds] = useState<SelectionBounds | null>(
    null
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const pendingUpdatesRef = useRef<
    Map<string, { position?: number[]; size?: number[]; rotation?: number }>
  >(new Map());
  const rafIdRef = useRef<number | null>(null);

  const updateDocument = useCallback(
    (updater: (doc: OcifSchemaBase) => OcifSchemaBase) => {
      onChange(updater(document));
    },
    [document, onChange]
  );

  const updateNodeProperties = useCallback(
    (
      nodeId: string,
      properties: {
        position?: number[];
        size?: number[];
        rotation?: number;
      }
    ) => {
      // Batch updates using requestAnimationFrame for performance
      const existingUpdate = pendingUpdatesRef.current.get(nodeId) || {};
      pendingUpdatesRef.current.set(nodeId, {
        ...existingUpdate,
        ...properties,
      });

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
                const nodeUpdates: Partial<typeof node> = {};
                if (update.position !== undefined) {
                  nodeUpdates.position = update.position;
                }
                if (update.size !== undefined) {
                  nodeUpdates.size = update.size;
                }
                if (update.rotation !== undefined) {
                  nodeUpdates.rotation = update.rotation;
                }
                return { ...node, ...nodeUpdates };
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
        id: generateId(),
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

      setEditorState((prev) => {
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

  const startNodeDrag = useCallback(
    (
      _nodeId: string,
      e: React.MouseEvent,
      nodePositions: Map<string, number[]>
    ) => {
      const container = canvasRef.current;
      if (!container) return;

      const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);

      setEditorState((prev) => ({
        ...prev,
        isDraggingNodes: true,
        nodeDragStart: { x: clientX, y: clientY },
        initialNodePositions: nodePositions,
      }));
    },
    []
  );

  const startRotation = useCallback(
    (e: React.MouseEvent, centerX: number, centerY: number) => {
      const container = canvasRef.current;
      if (!container) return;

      const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);

      // Calculate initial vector from center to mouse
      const initialVector = {
        x: clientX - centerX,
        y: clientY - centerY,
      };

      // Calculate initial angle
      const initialAngle = Math.atan2(initialVector.y, initialVector.x);

      // Store initial states of all selected nodes
      const initialNodeStates = new Map();
      selectedNodes.forEach((nodeId) => {
        const node = document.nodes?.find((n) => n.id === nodeId);
        if (node && node.position && node.position.length >= 2) {
          initialNodeStates.set(nodeId, {
            position: [...node.position],
            rotation: node.rotation ?? 0,
          });
        }
      });

      setEditorState((prev) => ({
        ...prev,
        isRotating: true,
        rotationStart: { x: clientX, y: clientY },
        rotationCenter: { x: centerX, y: centerY },
        initialRotationAngle: initialAngle,
        initialNodeStates,
      }));
    },
    [selectedNodes, document.nodes]
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
    // Editor state
    canvasRef,
    position: editorState.position,
    scale: editorState.scale,
    isDraggingNodes: editorState.isDraggingNodes,
    isRotating: editorState.isRotating,
    transform: `translate(${editorState.position.x}px, ${editorState.position.y}px) scale(${editorState.scale})`,
    drawingPoints: editorState.drawingPoints,

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

    // Editor state management
    editorState,
    setEditorState,

    // Actions
    zoomBy,

    // Document manipulation
    document,
    updateDocument,
    updateNodeProperties,
    createShapeNode,

    // Internal event handlers
    startNodeDrag,
    startRotation,
  };
};
