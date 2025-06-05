import { useContext } from "react";

import { CanvasContext } from "../contexts/CanvasContext";

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvasContext must be used within a CanvasProvider");
  }
  return context;
};
