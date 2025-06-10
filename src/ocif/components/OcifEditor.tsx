import clsx from "clsx";

import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import type { UseOcifEditor } from "../hooks/useOcifEditor";
import {
  getPerfectPointsFromPoints,
  getSvgPathFromPoints,
} from "../utils/drawing";
import { NodeContainer } from "./NodeContainer";
import { PropertiesPanel } from "./PropertiesPanel";
import { SelectionBounds } from "./SelectionBounds";
import { SelectionPreview } from "./SelectionPreview";
import { Toolbar } from "./Toolbar";
import { ZoomControls } from "./ZoomControls";

export const OcifEditor = ({ editor }: { editor: UseOcifEditor }) => {
  const { handleKeyDown, handleKeyUp } = useKeyboardShortcuts({ editor });

  return (
    <div
      className="ocif-editor-root"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <div
        ref={editor.canvasRef}
        className={clsx("ocif-editor", {
          "ocif-cursor-grab": editor.mode === "hand",
          "ocif-cursor-default": editor.mode === "select",
          "ocif-cursor-crosshair":
            editor.mode === "rectangle" ||
            editor.mode === "oval" ||
            editor.mode === "draw",
        })}
        onMouseDown={editor.handleMouseDown}
        onMouseMove={editor.handleMouseMove}
        onMouseUp={editor.handleMouseUp}
        onMouseLeave={editor.handleMouseUp}
        tabIndex={0}
      >
        <div
          className="ocif-editor-canvas"
          style={{ transform: editor.transform }}
        >
          {editor.document.nodes?.map((node) => (
            <NodeContainer
              key={node.id}
              node={node}
              document={editor.document}
              editor={editor}
            />
          ))}

          {editor.drawingPoints && (
            <svg style={{ position: "absolute", overflow: "visible" }}>
              <path
                d={getSvgPathFromPoints(
                  getPerfectPointsFromPoints(editor.drawingPoints)
                )}
                fill="#000"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="ocif-editor-ui">
        <SelectionBounds editor={editor} />
        <SelectionPreview editor={editor} />
        <PropertiesPanel editor={editor} />
        <ZoomControls editor={editor} />
        <Toolbar editor={editor} />
      </div>
    </div>
  );
};
