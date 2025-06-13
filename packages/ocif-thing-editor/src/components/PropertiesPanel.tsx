import { useEffect, useState } from "react";

import type { UseOcifEditor } from "../hooks/useOcifEditor";
import { Input } from "./ui/Input";

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
    editor.updateNodeProperties(selectedNode.id, {
      position: [newPosition.x, newPosition.y],
      size: [size.width, size.height],
    });
  };

  const handleSizeChange = (dimension: "width" | "height", value: string) => {
    const numValue = parseFloat(value) || 0;
    const newSize =
      dimension === "width"
        ? { ...size, width: numValue }
        : { ...size, height: numValue };
    setSize(newSize);
    editor.updateNodeProperties(selectedNode.id, {
      position: [position.x, position.y],
      size: [newSize.width, newSize.height],
    });
  };

  return (
    <div className="ocif-properties-panel">
      <div className="ocif-properties-panel-header">Node Properties</div>

      <div className="ocif-properties-panel-content">
        <div>
          <div className="ocif-properties-panel-content-grid">
            <div>
              <label htmlFor="x" className="ocif-input-label">
                X
              </label>

              <Input
                type="number"
                value={position.x}
                onChange={(e) => handlePositionChange("x", e.target.value)}
                step="1"
              />
            </div>

            <div>
              <label className="ocif-input-label">Y</label>

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
          <div className="ocif-properties-panel-content-grid">
            <div>
              <label className="ocif-input-label">W</label>

              <Input
                type="number"
                value={size.width}
                onChange={(e) => handleSizeChange("width", e.target.value)}
                step="1"
                min="1"
              />
            </div>

            <div>
              <label className="ocif-input-label">H</label>

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
