import { useCallback, useEffect, useRef, useState } from "react";

import type { OcifSchemaBase } from "ocif-thing-schema";

import type { EditorMode, SelectionBounds } from "../contexts/EditorContext";
import {
  calculateScaledDelta,
  getRelativeMousePosition,
  screenToCanvasPosition,
} from "../utils/coordinates";
import {
  getPerfectPointsFromPoints,
  getSvgPathFromPoints,
} from "../utils/drawing";
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
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
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
  const [drawingNodeId, setDrawingNodeId] = useState<string | null>(null);

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const container = canvasRef.current;
      if (!container) return;

      const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);

      if (mode === "hand") {
        setEditorState((prev) => ({
          ...prev,
          isDragging: true,
          dragStart: {
            x: e.clientX - prev.position.x,
            y: e.clientY - prev.position.y,
          },
        }));
      } else if (mode === "select" && !editorState.isDraggingNodes) {
        const { x: canvasX, y: canvasY } = screenToCanvasPosition(
          clientX,
          clientY,
          editorState.position,
          editorState.scale
        );

        setEditorState((prev) => ({
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
          editorState.position,
          editorState.scale
        );

        setEditorState((prev) => ({
          ...prev,
          isDrawingShape: true,
          shapeStart: { x: canvasX, y: canvasY },
        }));

        setSelectedNodes(new Set());
        const newNodeId = generateId();
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
          editorState.position,
          editorState.scale
        );

        setEditorState((prev) => ({
          ...prev,
          isDrawing: true,
          drawingPoints: [[canvasX, canvasY]],
        }));
      }
    },
    [
      mode,
      editorState.position,
      editorState.scale,
      editorState.isDraggingNodes,
      updateDocument,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const container = canvasRef.current;
      if (!container) return;

      const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);

      setEditorState((prev) => {
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
            editorState.position,
            editorState.scale
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
            editorState.scale
          );

          prev.initialNodePositions.forEach((initialPos, nodeId) => {
            if (initialPos.length >= 2) {
              const newPosition = [
                initialPos[0] + deltaX,
                initialPos[1] + deltaY,
              ];
              updateNodeProperties(nodeId, { position: newPosition });
            }
          });
        }

        if (prev.isRotating && mode === "select") {
          const { x: canvasX, y: canvasY } = screenToCanvasPosition(
            clientX,
            clientY,
            editorState.position,
            editorState.scale
          );

          // Calculate current vector from center to mouse
          const currentVector = {
            x: canvasX - prev.rotationCenter.x,
            y: canvasY - prev.rotationCenter.y,
          };

          // Calculate current angle
          const currentAngle = Math.atan2(currentVector.y, currentVector.x);

          // Calculate total angle difference from initial angle
          let totalRotation =
            (currentAngle - prev.initialRotationAngle) * (180 / Math.PI);

          // Normalize angle to -180 to 180 range
          while (totalRotation > 180) totalRotation -= 360;
          while (totalRotation < -180) totalRotation += 360;

          // Apply rotation to all selected nodes based on their initial states
          const nodeUpdates = new Map();

          prev.initialNodeStates.forEach((initialState, nodeId) => {
            const node = document.nodes?.find((n) => n.id === nodeId);

            if (node && node.size && node.size.length >= 2) {
              // Calculate new rotation and normalize to 0-360 range
              const rawRotation = initialState.rotation + totalRotation;
              let newRotation = ((rawRotation % 360) + 360) % 360;

              // Only apply snapping if we're rotating a single node
              if (prev.initialNodeStates.size === 1) {
                const snapThreshold = 10; // degrees
                const snapAngles = [0, 90, 180, 270, 360];

                // Find the closest snap angle, considering wrap-around
                const closestSnapAngle = snapAngles.reduce(
                  (closest, snapAngle) => {
                    // Calculate the shortest distance between angles using modulo
                    const diff = Math.abs(
                      ((newRotation - snapAngle + 180) % 360) - 180
                    );
                    const closestDiff = Math.abs(
                      ((newRotation - closest + 180) % 360) - 180
                    );
                    return diff < closestDiff ? snapAngle : closest;
                  }
                );

                // If within threshold, snap to the closest angle
                const diff = Math.abs(
                  ((newRotation - closestSnapAngle + 180) % 360) - 180
                );
                if (diff <= snapThreshold) {
                  // Use 0 instead of 360 for consistency
                  newRotation = closestSnapAngle === 360 ? 0 : closestSnapAngle;
                }
              }

              // Calculate initial node center
              const initialNodeCenter = {
                x: initialState.position[0] + node.size[0] / 2,
                y: initialState.position[1] + node.size[1] / 2,
              };

              // Calculate vector from rotation center to initial node center
              const vector = {
                x: initialNodeCenter.x - prev.rotationCenter.x,
                y: initialNodeCenter.y - prev.rotationCenter.y,
              };

              // Rotate the vector by total rotation
              const rad = (totalRotation * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);

              const rotatedVector = {
                x: vector.x * cos - vector.y * sin,
                y: vector.x * sin + vector.y * cos,
              };

              // Calculate new node center
              const newNodeCenter = {
                x: prev.rotationCenter.x + rotatedVector.x,
                y: prev.rotationCenter.y + rotatedVector.y,
              };

              // Calculate new position (top-left corner)
              const newPosition = [
                newNodeCenter.x - node.size[0] / 2,
                newNodeCenter.y - node.size[1] / 2,
              ];

              nodeUpdates.set(nodeId, {
                position: newPosition,
                rotation: newRotation,
              });
            }
          });

          // Apply all updates in a single document update
          if (nodeUpdates.size > 0) {
            if (rafIdRef.current !== null) {
              cancelAnimationFrame(rafIdRef.current);
            }
            rafIdRef.current = requestAnimationFrame(() => {
              updateDocument((doc) => ({
                ...doc,
                nodes: doc.nodes?.map((node) => {
                  const update = nodeUpdates.get(node.id);
                  return update
                    ? {
                        ...node,
                        position: update.position,
                        rotation: update.rotation,
                      }
                    : node;
                }),
              }));
              rafIdRef.current = null;
            });
          }
        }

        if (prev.isDrawingShape && drawingNodeId) {
          const { x: canvasX, y: canvasY } = screenToCanvasPosition(
            clientX,
            clientY,
            editorState.position,
            editorState.scale
          );

          const minX = Math.min(prev.shapeStart.x, canvasX);
          const minY = Math.min(prev.shapeStart.y, canvasY);
          const width = Math.abs(canvasX - prev.shapeStart.x);
          const height = Math.abs(canvasY - prev.shapeStart.y);

          updateNodeProperties(drawingNodeId, {
            position: [minX, minY],
            size: [width, height],
          });
        }

        if (prev.drawingPoints && mode === "draw") {
          const { x: canvasX, y: canvasY } = screenToCanvasPosition(
            clientX,
            clientY,
            editorState.position,
            editorState.scale
          );

          return {
            ...prev,
            drawingPoints: [...prev.drawingPoints, [canvasX, canvasY]],
          };
        }

        return prev;
      });
    },
    [
      mode,
      editorState.position,
      editorState.scale,
      updateNodeProperties,
      updateDocument,
      drawingNodeId,
      document.nodes,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (editorState.isDrawingShape && drawingNodeId) {
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
          updateNodeProperties(drawingNodeId, {
            position: [x, y],
            size: [100, 100],
          });
        }
      }
      setDrawingNodeId(null);
      setMode("select");
    }

    if (editorState.drawingPoints) {
      const points = editorState.drawingPoints;
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
          id: generateId(),
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

    setEditorState((prev) => {
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

      // Round positions and rotations when finishing rotation
      if (prev.isRotating && prev.initialNodeStates.size > 0) {
        updateDocument((doc) => ({
          ...doc,
          nodes: doc.nodes?.map((node) => {
            if (prev.initialNodeStates.has(node.id)) {
              return {
                ...node,
                position: node.position
                  ? [Math.round(node.position[0]), Math.round(node.position[1])]
                  : node.position,
                rotation:
                  node.rotation !== undefined
                    ? ((Math.round(node.rotation) % 360) + 360) % 360
                    : node.rotation,
              };
            }
            return node;
          }),
        }));
      }

      return {
        ...prev,
        isDragging: false,
        isSelecting: false,
        isDraggingNodes: false,
        isDrawingShape: false,
        isRotating: false,
        drawingPoints: undefined,
        initialNodePositions: new Map(),
        initialNodeStates: new Map(),
      };
    });

    if (mode === "select") {
      setSelectionBounds(null);
    }
  }, [
    mode,
    selectionBounds,
    editorState.isDrawingShape,
    editorState.drawingPoints,
    drawingNodeId,
    document.nodes,
    updateNodeProperties,
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
      const { x: canvasX, y: canvasY } = screenToCanvasPosition(
        clientX,
        clientY,
        editorState.position,
        editorState.scale
      );

      // Calculate initial vector from center to mouse
      const initialVector = {
        x: canvasX - centerX,
        y: canvasY - centerY,
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
    [editorState.position, editorState.scale, selectedNodes, document.nodes]
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

    // Actions
    zoomBy,

    // Document manipulation
    document,
    updateDocument,
    updateNodeProperties,
    createShapeNode,

    // Internal event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    startNodeDrag,
    startRotation,
  };
};
