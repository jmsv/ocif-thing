import { createContext } from "react";

export type CanvasMode = "select" | "hand";

export interface SelectionRectangle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface CanvasContextType {
  position: { x: number; y: number };
  scale: number;
  setScale: (scale: number) => void;
  zoomBy: (delta: number, anchor?: { x: number; y: number }) => void;
  transform: string;
  mode: CanvasMode;
  setMode: (mode: CanvasMode) => void;
  selectedNodes: Set<string>;
  setSelectedNodes: (nodes: Set<string>) => void;
  selectionRectangle: SelectionRectangle | null;
  setSelectionRectangle: (rect: SelectionRectangle | null) => void;
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

export const CanvasContext = createContext<CanvasContextType | null>(null);
