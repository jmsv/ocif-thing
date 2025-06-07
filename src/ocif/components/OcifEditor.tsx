import { cn } from "@/lib/utils";

import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import type { UseOcifEditor } from "../hooks/useOcifEditor";
import {
  getPerfectPointsFromPoints,
  getSvgPathFromPoints,
} from "../utils/drawing";
import { NodeContainer } from "./NodeContainer";
import { PropertiesPanel } from "./PropertiesPanel";
import { SelectionBounds } from "./SelectionBounds";
import { Toolbar } from "./Toolbar";
import { ZoomControls } from "./ZoomControls";

export const OcifEditor = ({ editor }: { editor: UseOcifEditor }) => {
  const { handleKeyDown, handleKeyUp } = useKeyboardShortcuts({ editor });

  return (
    <div className="relative h-full w-full">
      <div
        ref={editor.canvasRef}
        className={cn("relative h-full w-full overflow-hidden bg-gray-50", {
          "cursor-grab active:cursor-grabbing": editor.mode === "hand",
          "cursor-default": editor.mode === "select",
          "cursor-crosshair":
            editor.mode === "rectangle" ||
            editor.mode === "oval" ||
            editor.mode === "draw",
        })}
        onMouseDown={editor.handleMouseDown}
        onMouseMove={editor.handleMouseMove}
        onMouseUp={editor.handleMouseUp}
        onMouseLeave={editor.handleMouseUp}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
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

              {editor.drawingPoints && (
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    overflow: "visible",
                    userSelect: "none",
                  }}
                >
                  <path
                    d={getSvgPathFromPoints(
                      getPerfectPointsFromPoints(editor.drawingPoints)
                    )}
                    fill="#000"
                  />
                </svg>
              )}

              {editor.selectionBounds && (
                <div
                  className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/10"
                  style={{
                    left: Math.min(
                      editor.selectionBounds.startX,
                      editor.selectionBounds.endX
                    ),
                    top: Math.min(
                      editor.selectionBounds.startY,
                      editor.selectionBounds.endY
                    ),
                    width: Math.abs(
                      editor.selectionBounds.endX -
                        editor.selectionBounds.startX
                    ),
                    height: Math.abs(
                      editor.selectionBounds.endY -
                        editor.selectionBounds.startY
                    ),
                  }}
                />
              )}
            </div>
          </div>

          <SelectionBounds editor={editor} />

          <PropertiesPanel editor={editor} />
        </div>
      </div>

      <ZoomControls editor={editor} />
      <Toolbar editor={editor} />
    </div>
  );
};
