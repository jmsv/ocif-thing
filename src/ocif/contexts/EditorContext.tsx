import { createContext } from "react";

export type EditorMode = "select" | "hand" | "rectangle" | "oval";

export interface SelectionBounds {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface EditorContextType {
  position: { x: number; y: number };
  scale: number;
  setScale: (scale: number) => void;
  zoomBy: (delta: number, anchor?: { x: number; y: number }) => void;
  transform: string;
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  selectedNodes: Set<string>;
  setSelectedNodes: (nodes: Set<string>) => void;
  selectionBounds: SelectionBounds | null;
  setSelectionBounds: (bounds: SelectionBounds | null) => void;
  handleMouseUp: (
    nodes?: Array<{ id: string; position: number[]; size: number[] }>
  ) => void;
  startNodeDrag: (
    nodeId: string,
    e: React.MouseEvent,
    nodePositions: Map<string, number[]>
  ) => void;
  isDraggingNodes: boolean;
  drawingBounds: SelectionBounds | null;
  setDrawingBounds: (bounds: SelectionBounds | null) => void;
  createShapeNode: (bounds: SelectionBounds) => void;
}

export const EditorContext = createContext<EditorContextType | null>(null);
