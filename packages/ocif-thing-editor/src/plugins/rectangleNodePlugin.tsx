import { Square } from "lucide-react";

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

export const rectangleNodePlugin: EditorPlugin = {
  name: "rectangle-node",

  // Toolbar contribution
  addToolbarItems: () => [
    {
      id: "rectangle",
      type: "toggle",
      icon: Square,
      label: "Rectangle",
      tooltip: "Draw rectangles (R)",
      shortcut: "r",
      isActive: (editor) => editor.mode === "rectangle",
      onClick: (editor) => editor.setMode("rectangle"),
      priority: 80,
    },
  ],

  // Keyboard shortcut contribution
  addKeyboardShortcuts: () => [
    {
      id: "rectangle-tool",
      key: "r",
      description: "Switch to rectangle tool",
      handler: (editor, event) => {
        event.preventDefault();
        setTemporaryHandMode(false);
        editor.setMode("rectangle");
        return true;
      },
      priority: 70,
    },
  ],

  // Mouse event handling for rectangle drawing
  onMouseDown: (event) => {
    const { editor, originalEvent } = event;

    if (editor.mode === "rectangle") {
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
      editor.mode === "rectangle"
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
      editor.mode === "rectangle"
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
      type: "@ocif/node/rect",
      displayName: "Rectangle",
      renderComponent: ({ node, extension }) => {
        if (!node.size || node.size.length < 2) {
          return null;
        }

        // Type assertion for OCIF schema compliance
        const rectExtension = extension as {
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
              borderWidth: rectExtension.strokeWidth,
              borderColor: rectExtension.strokeColor,
              backgroundColor: rectExtension.fillColor,
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
