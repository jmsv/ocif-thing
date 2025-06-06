import { cn } from "@/lib/utils";

import type { CanvasEditor } from "../hooks/useCanvasEditor";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { NodeContainer } from "./NodeContainer";
import { PropertiesPanel } from "./PropertiesPanel";
import { SelectionBounds } from "./SelectionBounds";
import { Toolbar } from "./Toolbar";
import { ZoomControls } from "./ZoomControls";

interface DocumentCanvasProps {
  editor: CanvasEditor;
}

export const DocumentCanvas = ({ editor }: DocumentCanvasProps) => {
  const { handleKeyDown } = useKeyboardShortcuts({ editor });

  const getRectangleStyle = (rectangle: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }) => ({
    left:
      Math.min(rectangle.startX, rectangle.endX) * editor.scale +
      editor.position.x,
    top:
      Math.min(rectangle.startY, rectangle.endY) * editor.scale +
      editor.position.y,
    width: Math.abs(rectangle.endX - rectangle.startX) * editor.scale,
    height: Math.abs(rectangle.endY - rectangle.startY) * editor.scale,
  });

  const handleMouseUpWithNodes = () => {
    const nodes =
      editor.document.nodes?.map((node) => ({
        id: node.id,
        position: node.position || [0, 0],
        size: node.size || [0, 0],
      })) || [];
    editor.handleMouseUp(nodes);
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={editor.canvasRef}
        className={cn("relative h-full w-full overflow-hidden bg-gray-50", {
          "cursor-grab active:cursor-grabbing": editor.mode === "hand",
          "cursor-default": editor.mode === "select",
          "cursor-crosshair": editor.mode === "rectangle",
        })}
        onMouseDown={editor.handleMouseDown}
        onMouseMove={editor.handleMouseMove}
        onMouseUp={handleMouseUpWithNodes}
        onMouseLeave={handleMouseUpWithNodes}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="absolute inset-0">
          <div className="absolute" style={{ transform: editor.transform }}>
            <div className="relative">
              {editor.document.nodes?.map((node) => (
                <NodeContainer
                  key={node.id}
                  node={node}
                  document={editor.document}
                  editor={editor}
                />
              ))}
            </div>
          </div>

          {editor.selectionRectangle && (
            <div
              className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/10"
              style={getRectangleStyle(editor.selectionRectangle)}
            />
          )}

          {editor.drawingRectangle && (
            <div
              className="pointer-events-none absolute border-2 border-black bg-white opacity-50"
              style={getRectangleStyle(editor.drawingRectangle)}
            />
          )}

          <SelectionBounds
            document={editor.document}
            editor={editor}
            onUpdateNodeGeometry={editor.updateNodeGeometry}
          />

          <PropertiesPanel
            document={editor.document}
            editor={editor}
            onUpdateNodeGeometry={editor.updateNodeGeometry}
          />
        </div>
      </div>

      <ZoomControls editor={editor} />
      <Toolbar editor={editor} />
    </div>
  );
};
