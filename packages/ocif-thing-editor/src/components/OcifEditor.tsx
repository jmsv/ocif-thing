import { useEffect } from "react";

import clsx from "clsx";

import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useMouseEvents } from "../hooks/useMouseEvents";
import type { UseOcifEditor } from "../hooks/useOcifEditor";
import { usePlugins } from "../hooks/usePlugins";
import {
  getPerfectPointsFromPoints,
  getSvgPathFromPoints,
} from "../utils/drawing";
import { NodeContainer } from "./NodeContainer";
import { PluginToolbar } from "./PluginToolbar";
import { PropertiesPanel } from "./PropertiesPanel";
import { SelectionBounds } from "./SelectionBounds";
import { SelectionPreview } from "./SelectionPreview";
import { ZoomControls } from "./ZoomControls";

export const OcifEditor = ({ editor }: { editor: UseOcifEditor }) => {
  const pluginManager = usePlugins();
  const { handleKeyDown, handleKeyUp } = useKeyboardShortcuts({
    editor,
    pluginManager,
  });
  const { handleMouseDown, handleMouseMove, handleMouseUp } = useMouseEvents({
    editor,
  });

  // Plugin lifecycle management
  useEffect(() => {
    pluginManager.activatePlugins(editor);

    return () => {
      pluginManager.deactivatePlugins(editor);
    };
  }, [pluginManager, editor]);

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
        <PluginToolbar editor={editor} pluginManager={pluginManager} />
      </div>
    </div>
  );
};
