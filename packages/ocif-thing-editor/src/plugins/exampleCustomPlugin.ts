import type { EditorPlugin } from "./types";

/**
 * Example custom plugin that demonstrates how users can extend the editor
 * This plugin adds a simple console log when clicking in a custom mode
 */
export const exampleCustomPlugin: EditorPlugin = {
  name: "example-custom",

  onMouseDown: (event) => {
    const { editor, originalEvent } = event;

    // Example: Add custom behavior for a hypothetical "custom" mode
    if (
      editor.mode === "select" &&
      "shiftKey" in originalEvent &&
      originalEvent.shiftKey
    ) {
      const mouseEvent = originalEvent as React.MouseEvent;
      console.log("Custom plugin: Shift+click detected!", {
        position: { x: mouseEvent.clientX, y: mouseEvent.clientY },
        selectedNodes: Array.from(editor.selectedNodes),
      });

      // Return true to indicate we handled this event
      // This prevents other plugins from processing it
      return true;
    }

    // Return false to let other plugins handle the event
    return false;
  },

  onKeyDown: (event) => {
    const { originalEvent } = event;

    // Example: Add custom keyboard shortcut
    if (
      "key" in originalEvent &&
      originalEvent.key === "c" &&
      "ctrlKey" in originalEvent &&
      originalEvent.ctrlKey
    ) {
      console.log("Custom plugin: Custom Ctrl+C shortcut triggered!");
      // You could implement custom copy behavior here
      return true; // Handled
    }

    return false; // Not handled
  },

  // Example: Add custom toolbar items
  addToolbarItems: () => [
    {
      id: "custom-tool",
      type: "button",
      label: "Custom Tool",
      tooltip: "This is a custom tool added by a plugin",
      onClick: (editor) => {
        console.log("Custom tool clicked!", { editor });
        // Add custom tool behavior here
      },
      group: "custom",
      priority: 50,
    },
  ],

  // Plugin lifecycle hooks
  onActivate: (editor) => {
    console.log("Example custom plugin activated for editor:", editor);
  },

  onDeactivate: (editor) => {
    console.log("Example custom plugin deactivated for editor:", editor);
  },
};
