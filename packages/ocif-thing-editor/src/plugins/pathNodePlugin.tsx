import { useMemo } from "react";

import { Pen } from "lucide-react";
import svgPathBounds from "svg-path-bounds";

import {
  finishPathDrawing,
  startPathDrawing,
  updatePathDrawing,
} from "../actions/pathDrawingActions";
import { baseNodeStyles } from "../utils/node";
import { setTemporaryHandMode } from "./handToolPlugin";
import type { EditorPlugin } from "./types";

export const pathNodePlugin: EditorPlugin = {
  name: "path-node",

  // Toolbar contribution
  addToolbarItems: () => [
    {
      id: "draw",
      type: "toggle",
      icon: Pen,
      label: "Draw",
      tooltip: "Draw paths (D)",
      shortcut: "d",
      isActive: (editor) => editor.mode === "draw",
      onClick: (editor) => editor.setMode("draw"),
      priority: 50, // Lowest priority - appears at the end
    },
  ],

  // Keyboard shortcut contribution
  addKeyboardShortcuts: () => [
    {
      id: "draw-tool",
      key: "d",
      description: "Switch to draw tool",
      handler: (editor, event) => {
        event.preventDefault();
        setTemporaryHandMode(false);
        editor.setMode("draw");
        return true;
      },
      priority: 70,
    },
  ],

  // Mouse event handling for path drawing
  onMouseDown: (event) => {
    const { editor, originalEvent } = event;

    if (editor.mode === "draw") {
      startPathDrawing(editor, originalEvent as React.MouseEvent);
      return true;
    }
    return false;
  },

  onMouseMove: (event) => {
    const { editor, originalEvent } = event;

    if (editor.editorState.drawingPoints && editor.mode === "draw") {
      updatePathDrawing(editor, originalEvent as React.MouseEvent);
      return true;
    }
    return false;
  },

  onMouseUp: (event) => {
    const { editor } = event;

    if (editor.editorState.drawingPoints) {
      finishPathDrawing(editor);
      return true;
    }
    return false;
  },

  // Node rendering
  addNodeExtensions: () => [
    {
      type: "@ocif/node/path",
      displayName: "Path",
      renderComponent: ({ node, extension }) => {
        return <PathComponent node={node} extension={extension} />;
      },
    },
  ],
};

// Separate component for path rendering with bounds calculation
const PathComponent = ({
  node,
  extension,
}: {
  node: { size?: number[] };
  extension: Record<string, unknown>;
}) => {
  const pathExtension = extension as {
    path: string;
    strokeWidth?: number;
    strokeColor?: string;
    fillColor?: string;
  };

  const bounds = useMemo(
    () => svgPathBounds(pathExtension.path),
    [pathExtension.path]
  );
  const [, , right, bottom] = bounds;

  const width = node.size?.[0] ?? right;
  const height = node.size?.[1] ?? bottom;

  return (
    <svg
      viewBox={`0 0 ${right} ${bottom}`}
      style={{
        ...baseNodeStyles,
        width,
        height,
      }}
      preserveAspectRatio="none"
    >
      <path
        d={pathExtension.path}
        stroke={pathExtension.strokeColor}
        strokeWidth={pathExtension.strokeWidth}
        fill={pathExtension.fillColor}
      />
    </svg>
  );
};
