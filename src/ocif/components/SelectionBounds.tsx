import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import type { CanvasEditor } from "../hooks/useCanvasEditor";
import type { OcifDocument } from "../schema";

interface SelectionBoundsProps {
  document: OcifDocument;
  editor: CanvasEditor;
  onUpdateNodeGeometry: (
    nodeId: string,
    position: number[],
    size: number[]
  ) => void;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const ResizeHandle = ({
  position,
  cursor,
  onMouseDown,
}: {
  position: string;
  cursor: string;
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  const handlePositions = {
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "top-center": "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "middle-left": "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
    "middle-right": "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto absolute h-3 w-3 rounded-sm border-2 border-white bg-blue-500 hover:bg-blue-600",
        handlePositions[position as keyof typeof handlePositions]
      )}
      style={{ cursor }}
      onMouseDown={onMouseDown}
    />
  );
};

export const SelectionBounds = ({
  document,
  editor,
  onUpdateNodeGeometry,
}: SelectionBoundsProps) => {
  const { selectedNodes, position, scale } = editor;
  const [isResizing, setIsResizing] = useState(false);
  const [resizeState, setResizeState] = useState<{
    handlePosition: string;
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
      document.nodes?.filter(
        (node) =>
          selectedNodes.has(node.id) &&
          node.position &&
          node.size &&
          node.position.length >= 2 &&
          node.size.length >= 2
      ) || [],
    [document.nodes, selectedNodes]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeState) return;

      const deltaX = (e.clientX - resizeState.startMousePos.x) / scale;
      const deltaY = (e.clientY - resizeState.startMousePos.y) / scale;

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
        onUpdateNodeGeometry(
          initialGeometry.id,
          [newLeft, newTop],
          [newNodeWidth, newNodeHeight]
        );
      });
    },
    [isResizing, resizeState, scale, onUpdateNodeGeometry]
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

  if (selectedNodes.size === 0) return null;
  if (selectedNodesList.length === 0) return null;

  // Calculate bounding box of all selected nodes
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

  const handleMouseDown = (handlePosition: string) => (e: React.MouseEvent) => {
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

  // Calculate the visual bounds for rendering
  const visualBounds = {
    left: Math.min(bounds.left, bounds.right),
    top: Math.min(bounds.top, bounds.bottom),
    width: Math.abs(bounds.right - bounds.left),
    height: Math.abs(bounds.bottom - bounds.top),
  };

  return (
    <div
      className="pointer-events-none absolute border-2 border-blue-500/50"
      style={{
        left: visualBounds.left * scale + position.x,
        top: visualBounds.top * scale + position.y,
        width: visualBounds.width * scale,
        height: visualBounds.height * scale,
      }}
    >
      {/* Corner handles */}
      <ResizeHandle
        position="top-left"
        cursor="nw-resize"
        onMouseDown={handleMouseDown("top-left")}
      />
      <ResizeHandle
        position="top-right"
        cursor="ne-resize"
        onMouseDown={handleMouseDown("top-right")}
      />
      <ResizeHandle
        position="bottom-left"
        cursor="sw-resize"
        onMouseDown={handleMouseDown("bottom-left")}
      />
      <ResizeHandle
        position="bottom-right"
        cursor="se-resize"
        onMouseDown={handleMouseDown("bottom-right")}
      />

      {/* Edge handles */}
      <ResizeHandle
        position="top-center"
        cursor="n-resize"
        onMouseDown={handleMouseDown("top-center")}
      />
      <ResizeHandle
        position="bottom-center"
        cursor="s-resize"
        onMouseDown={handleMouseDown("bottom-center")}
      />
      <ResizeHandle
        position="middle-left"
        cursor="w-resize"
        onMouseDown={handleMouseDown("middle-left")}
      />
      <ResizeHandle
        position="middle-right"
        cursor="e-resize"
        onMouseDown={handleMouseDown("middle-right")}
      />
    </div>
  );
};
