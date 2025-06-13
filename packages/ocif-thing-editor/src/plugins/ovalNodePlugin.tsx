import { Circle } from "lucide-react";

import {
  finishShapeDrawing,
  startShapeDrawing,
  updateShapeDrawing,
} from "../actions/shapeDrawingActions";
import { baseNodeStyles } from "../utils/node";
import { setTemporaryHandMode } from "./handToolPlugin";
import type { EditorPlugin } from "./types";

// Module-level variable to track drawing state
let drawingNodeId: string | null = null;

export const ovalNodePlugin: EditorPlugin = {
  name: "oval-node",

  // Toolbar contribution
  addToolbarItems: () => [
    {
      id: "oval",
      type: "toggle",
      icon: Circle,
      label: "Oval",
      tooltip: "Draw ovals (O)",
      shortcut: "o",
      isActive: (editor) => editor.mode === "oval",
      onClick: (editor) => editor.setMode("oval"),
      priority: 90,
    },
  ],

  // Keyboard shortcut contribution
  addKeyboardShortcuts: () => [
    {
      id: "oval-tool",
      key: "o",
      description: "Switch to oval tool",
      handler: (editor, event) => {
        event.preventDefault();
        setTemporaryHandMode(false);
        editor.setMode("oval");
        return true;
      },
      priority: 70,
    },
  ],

  // Mouse event handling for oval drawing
  onMouseDown: (event) => {
    const { editor, originalEvent } = event;

    if (editor.mode === "oval") {
      const nodeId = startShapeDrawing(
        editor,
        originalEvent as React.MouseEvent,
        editor.mode
      );
      drawingNodeId = nodeId || null;
      return true;
    }
    return false;
  },

  onMouseMove: (event) => {
    const { editor, originalEvent } = event;

    if (
      editor.editorState.isDrawingShape &&
      drawingNodeId &&
      editor.mode === "oval"
    ) {
      updateShapeDrawing(
        editor,
        originalEvent as React.MouseEvent,
        drawingNodeId
      );
      return true;
    }
    return false;
  },

  onMouseUp: (event) => {
    const { editor } = event;

    if (
      editor.editorState.isDrawingShape &&
      drawingNodeId &&
      editor.mode === "oval"
    ) {
      finishShapeDrawing(editor, drawingNodeId);
      drawingNodeId = null;
      return true;
    }
    return false;
  },

  // Node rendering
  addNodeExtensions: () => [
    {
      type: "@ocif/node/oval",
      displayName: "Oval",
      renderComponent: ({ node, extension }) => {
        if (!node.size || node.size.length < 2) {
          return null;
        }

        // Type assertion for OCIF schema compliance
        const ovalExtension = extension as {
          strokeWidth?: number;
          strokeColor?: string;
          fillColor?: string;
        };

        return (
          <div
            style={{
              ...baseNodeStyles,
              width: node.size[0],
              height: node.size[1],
              borderStyle: "solid",
              borderWidth: ovalExtension.strokeWidth,
              borderColor: ovalExtension.strokeColor,
              backgroundColor: ovalExtension.fillColor,
              borderRadius: "50%",
            }}
          />
        );
      },
      createDefaultExtension: () => ({
        strokeWidth: 2,
        strokeColor: "#000",
        fillColor: "#fff",
      }),
    },
  ],
};
