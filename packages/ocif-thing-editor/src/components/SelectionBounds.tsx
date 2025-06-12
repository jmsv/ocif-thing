import { useCallback, useEffect, useMemo, useState } from "react";

import type { UseOcifEditor } from "../hooks/useOcifEditor";
import { canvasToScreenPosition, getRotatedBounds } from "../utils/coordinates";

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
      rotation: number;
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

      // Calculate scale factors from bounds change
      const scaleX = originalWidth > 0 ? newWidth / originalWidth : 1;
      const scaleY = originalHeight > 0 ? newHeight / originalHeight : 1;

      // Apply transformations to selected nodes
      resizeState.initialNodeGeometries.forEach((initialGeometry) => {
        const rotation = initialGeometry.rotation;
        const originalLeft = initialGeometry.position[0];
        const originalTop = initialGeometry.position[1];
        const originalNodeWidth = initialGeometry.size[0];
        const originalNodeHeight = initialGeometry.size[1];

        // Calculate the center of the original node
        const originalCenter = {
          x: originalLeft + originalNodeWidth / 2,
          y: originalTop + originalNodeHeight / 2,
        };

        // Calculate relative position of center within original bounds
        const relativeX =
          (originalCenter.x - resizeState.startBounds.left) / originalWidth;
        const relativeY =
          (originalCenter.y - resizeState.startBounds.top) / originalHeight;

        // Calculate new center position (this moves with the selection)
        const newCenter = {
          x: newBounds.left + relativeX * newWidth,
          y: newBounds.top + relativeY * newHeight,
        };

        // Apply scale in a rotation-aware way (works for all rotations including 0°)
        // Convert rotation to radians
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Transform the scale factors to the node's coordinate system
        // When user drags horizontally on a 90° rotated node, it should affect the node's height
        const localScaleX = cos * cos * scaleX + sin * sin * scaleY;
        const localScaleY = sin * sin * scaleX + cos * cos * scaleY;

        const newNodeWidth = Math.round(originalNodeWidth * localScaleX);
        const newNodeHeight = Math.round(originalNodeHeight * localScaleY);

        // Calculate new top-left position
        const newLeft = Math.round(newCenter.x - newNodeWidth / 2);
        const newTop = Math.round(newCenter.y - newNodeHeight / 2);

        // Update the document
        editor.updateNodeProperties(initialGeometry.id, {
          position: [newLeft, newTop],
          size: [newNodeWidth, newNodeHeight],
        });
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

  // Hide selection bounds during interactive operations
  if (editor.isDraggingNodes || editor.isRotating || isResizing) return null;

  const bounds = selectedNodesList.reduce<Bounds | null>((acc, node) => {
    const rotation = node.rotation ?? 0;
    const x = node.position![0];
    const y = node.position![1];
    const width = node.size![0];
    const height = node.size![1];

    const rotatedBounds = getRotatedBounds(x, y, width, height, rotation);

    if (!acc) {
      return rotatedBounds;
    }

    return {
      left: Math.min(acc.left, rotatedBounds.left),
      top: Math.min(acc.top, rotatedBounds.top),
      right: Math.max(acc.right, rotatedBounds.right),
      bottom: Math.max(acc.bottom, rotatedBounds.bottom),
    };
  }, null);

  if (!bounds) return null;

  // Calculate selection center
  const selectionCenter = {
    x: (bounds.left + bounds.right) / 2,
    y: (bounds.top + bounds.bottom) / 2,
  };

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Use the editor's rotation system
    editor.startRotation(e, selectionCenter.x, selectionCenter.y);
  };

  const handleMouseDown =
    (handlePosition: HandlePosition) => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);

      const initialNodeGeometries = selectedNodesList.map((node) => ({
        id: node.id,
        position: [...node.position!],
        size: [...node.size!],
        rotation: node.rotation ?? 0,
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

      {/* Rotate handle */}
      <div
        className="ocif-selection-bounds-rotate-handle"
        onMouseDown={handleRotateMouseDown}
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
