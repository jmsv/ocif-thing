import { createContext } from "react";

export type CanvasMode = "select" | "hand";

export interface CanvasContextType {
  position: { x: number; y: number };
  scale: number;
  setScale: (scale: number) => void;
  zoomBy: (delta: number, anchor?: { x: number; y: number }) => void;
  transform: string;
  mode: CanvasMode;
  setMode: (mode: CanvasMode) => void;
}

export const CanvasContext = createContext<CanvasContextType | null>(null);
