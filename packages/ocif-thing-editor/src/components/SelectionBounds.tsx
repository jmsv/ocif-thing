import { useCallback, useEffect, useMemo, useState } from "react";

import type { UseOcifEditor } from "../hooks/useOcifEditor";
import { canvasToScreenPosition } from "../utils/coordinates";

type HandlePosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const SelectionBounds = ({ editor }: { editor: UseOcifEditor }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeState, setResizeState] = useState<{
    handlePosition: HandlePosition;
    startBounds: Bounds;
    startMousePos: { x: number; y: number };
    initialNodeGeometries: Array<{
      id: string;
      position: number[];
      size: number[];
    }>;
  } | null>(null);

  const selectedNodesList = useMemo(
    () =>
      editor.document.nodes?.filter(
        (node) =>
          editor.selectedNodes.has(node.id) &&
          node.position &&
          node.size &&
          node.position.length >= 2 &&
          node.size.length >= 2
      ) || [],
    [editor.document.nodes, editor.selectedNodes]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeState) return;

      const deltaX = (e.clientX - resizeState.startMousePos.x) / editor.scale;
      const deltaY = (e.clientY - resizeState.startMousePos.y) / editor.scale;

      const newBounds = { ...resizeState.startBounds };

      switch (resizeState.handlePosition) {
        case "top-left":
          newBounds.left += deltaX;
          newBounds.top += deltaY;
          break;
        case "top-center":
          newBounds.top += deltaY;
          break;
        case "top-right":
          newBounds.right += deltaX;
          newBounds.top += deltaY;
          break;
        case "middle-left":
          newBounds.left += deltaX;
          break;
        case "middle-right":
          newBounds.right += deltaX;
          break;
        case "bottom-left":
          newBounds.left += deltaX;
          newBounds.bottom += deltaY;
          break;
        case "bottom-center":
          newBounds.bottom += deltaY;
          break;
        case "bottom-right":
          newBounds.right += deltaX;
          newBounds.bottom += deltaY;
          break;
      }

      // Swap bounds if needed to maintain positive dimensions
      if (newBounds.right < newBounds.left) {
        [newBounds.left, newBounds.right] = [newBounds.right, newBounds.left];
      }
      if (newBounds.bottom < newBounds.top) {
        [newBounds.top, newBounds.bottom] = [newBounds.bottom, newBounds.top];
      }

      // Calculate dimensions for scaling
      const originalWidth =
        resizeState.startBounds.right - resizeState.startBounds.left;
      const originalHeight =
        resizeState.startBounds.bottom - resizeState.startBounds.top;
      const newWidth = newBounds.right - newBounds.left;
      const newHeight = newBounds.bottom - newBounds.top;

      // Apply transformations to selected nodes
      resizeState.initialNodeGeometries.forEach((initialGeometry) => {
        const originalLeft = initialGeometry.position[0];
        const originalTop = initialGeometry.position[1];
        const originalNodeWidth = initialGeometry.size[0];
        const originalNodeHeight = initialGeometry.size[1];

        // Calculate relative position within original bounds
        const relativeX =
          (originalLeft - resizeState.startBounds.left) / originalWidth;
        const relativeY =
          (originalTop - resizeState.startBounds.top) / originalHeight;
        const relativeWidth = originalNodeWidth / originalWidth;
        const relativeHeight = originalNodeHeight / originalHeight;

        // Calculate new position and size
        const newLeft = Math.round(newBounds.left + relativeX * newWidth);
        const newTop = Math.round(newBounds.top + relativeY * newHeight);
        const newNodeWidth = Math.round(relativeWidth * newWidth);
        const newNodeHeight = Math.round(relativeHeight * newHeight);

        // Update the document
        editor.updateNodeGeometry(
          initialGeometry.id,
          [newLeft, newTop],
          [newNodeWidth, newNodeHeight]
        );
      });
    },
    [isResizing, resizeState, editor]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeState(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      const doc = window.document;
      doc.addEventListener("mousemove", handleMouseMove);
      doc.addEventListener("mouseup", handleMouseUp);
      return () => {
        doc.removeEventListener("mousemove", handleMouseMove);
        doc.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (editor.selectedNodes.size === 0) return null;
  if (selectedNodesList.length === 0) return null;

  const bounds = selectedNodesList.reduce<Bounds | null>((acc, node) => {
    const left = node.position![0];
    const top = node.position![1];
    const right = left + node.size![0];
    const bottom = top + node.size![1];

    if (!acc) {
      return { left, top, right, bottom };
    }

    return {
      left: Math.min(acc.left, left),
      top: Math.min(acc.top, top),
      right: Math.max(acc.right, right),
      bottom: Math.max(acc.bottom, bottom),
    };
  }, null);

  if (!bounds) return null;

  const handleMouseDown =
    (handlePosition: HandlePosition) => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);

      const initialNodeGeometries = selectedNodesList.map((node) => ({
        id: node.id,
        position: [...node.position!],
        size: [...node.size!],
      }));

      setResizeState({
        handlePosition,
        startBounds: { ...bounds },
        startMousePos: { x: e.clientX, y: e.clientY },
        initialNodeGeometries,
      });
    };

  const visualBounds = {
    left: Math.min(bounds.left, bounds.right),
    top: Math.min(bounds.top, bounds.bottom),
    width: Math.abs(bounds.right - bounds.left),
    height: Math.abs(bounds.bottom - bounds.top),
  };

  const { x, y } = canvasToScreenPosition(
    visualBounds.left,
    visualBounds.top,
    editor.position,
    editor.scale
  );

  return (
    <div
      className="ocif-selection-bounds"
      style={{
        left: x,
        top: y,
        width: visualBounds.width * editor.scale,
        height: visualBounds.height * editor.scale,
      }}
    >
      {/* Corner handles */}
      <ResizeHandle
        position="top-left"
        onMouseDown={handleMouseDown("top-left")}
      />
      <ResizeHandle
        position="top-right"
        onMouseDown={handleMouseDown("top-right")}
      />
      <ResizeHandle
        position="bottom-left"
        onMouseDown={handleMouseDown("bottom-left")}
      />
      <ResizeHandle
        position="bottom-right"
        onMouseDown={handleMouseDown("bottom-right")}
      />

      {/* Edge handles */}
      <ResizeHandle
        position="top-center"
        onMouseDown={handleMouseDown("top-center")}
      />
      <ResizeHandle
        position="bottom-center"
        onMouseDown={handleMouseDown("bottom-center")}
      />
      <ResizeHandle
        position="middle-left"
        onMouseDown={handleMouseDown("middle-left")}
      />
      <ResizeHandle
        position="middle-right"
        onMouseDown={handleMouseDown("middle-right")}
      />
    </div>
  );
};

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const ResizeHandle = ({
  position,
  onMouseDown,
}: {
  position: HandlePosition;
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  return (
    <div
      className="ocif-selection-bounds-handle"
      data-position={position}
      onMouseDown={onMouseDown}
    />
  );
};
