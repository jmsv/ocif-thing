import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { UseOcifEditor } from "../hooks/useOcifEditor";

export const PropertiesPanel = ({ editor }: { editor: UseOcifEditor }) => {
  const selectedNodeId =
    editor.selectedNodes.size === 1
      ? Array.from(editor.selectedNodes)[0]
      : null;
  const selectedNode = selectedNodeId
    ? editor.document.nodes?.find((node) => node.id === selectedNodeId)
    : null;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (selectedNode) {
      setPosition({
        x: selectedNode.position?.[0] || 0,
        y: selectedNode.position?.[1] || 0,
      });
      setSize({
        width: selectedNode.size?.[0] || 0,
        height: selectedNode.size?.[1] || 0,
      });
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handlePositionChange = (axis: "x" | "y", value: string) => {
    const numValue = parseFloat(value) || 0;
    const newPosition =
      axis === "x"
        ? { ...position, x: numValue }
        : { ...position, y: numValue };
    setPosition(newPosition);
    editor.updateNodeGeometry(
      selectedNode.id,
      [newPosition.x, newPosition.y],
      [size.width, size.height]
    );
  };

  const handleSizeChange = (dimension: "width" | "height", value: string) => {
    const numValue = parseFloat(value) || 0;
    const newSize =
      dimension === "width"
        ? { ...size, width: numValue }
        : { ...size, height: numValue };
    setSize(newSize);
    editor.updateNodeGeometry(
      selectedNode.id,
      [position.x, position.y],
      [newSize.width, newSize.height]
    );
  };

  return (
    <div
      className="absolute top-4 right-4 flex w-64 flex-col gap-3 rounded-lg border bg-background p-3 select-none"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="text-sm font-medium text-foreground">Node Properties</div>

      <div className="space-y-3">
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">X</Label>
              <Input
                type="number"
                value={position.x}
                onChange={(e) => handlePositionChange("x", e.target.value)}
                step="1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Y</Label>
              <Input
                type="number"
                value={position.y}
                onChange={(e) => handlePositionChange("y", e.target.value)}
                step="1"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">W</Label>
              <Input
                type="number"
                value={size.width}
                onChange={(e) => handleSizeChange("width", e.target.value)}
                step="1"
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">H</Label>
              <Input
                type="number"
                value={size.height}
                onChange={(e) => handleSizeChange("height", e.target.value)}
                step="1"
                min="1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
