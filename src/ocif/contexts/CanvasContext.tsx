import { createContext } from "react";

export interface CanvasContextType {
  position: { x: number; y: number };
  scale: number;
  setScale: (scale: number) => void;
  zoomBy: (delta: number, anchor?: { x: number; y: number }) => void;
  transform: string;
}

export const CanvasContext = createContext<CanvasContextType | null>(null);
