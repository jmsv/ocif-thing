import type { EditorPlugin } from "./types";

export const zoomPlugin: EditorPlugin = {
  name: "zoom",

  addKeyboardShortcuts: () => [
    {
      id: "zoom-in",
      key: "+",
      ctrlOrCmdKey: true,
      description: "Zoom in",
      handler: (editor, event) => {
        event.preventDefault();
        editor.zoomBy(0.2);
        return true;
      },
      priority: 80,
    },
    {
      id: "zoom-in-equals",
      key: "=",
      ctrlOrCmdKey: true,
      description: "Zoom in",
      handler: (editor, event) => {
        event.preventDefault();
        editor.zoomBy(0.2);
        return true;
      },
      priority: 80,
    },
    {
      id: "zoom-out",
      key: "-",
      ctrlOrCmdKey: true,
      description: "Zoom out",
      handler: (editor, event) => {
        event.preventDefault();
        editor.zoomBy(-0.2);
        return true;
      },
      priority: 80,
    },
  ],
};
