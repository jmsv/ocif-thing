import { copySelectedNodes } from "../actions/copySelectedNodes";
import { pasteNodes } from "../actions/pasteNodes";
import { selectAllNodes } from "../actions/selectAllNodes";
import type { CopiedNode } from "../actions/types";
import type { EditorPlugin } from "./types";

// Module-level state for copied nodes (until we have a better state management solution)
let copiedNodes: CopiedNode[] = [];

export const clipboardPlugin: EditorPlugin = {
  name: "clipboard",

  addKeyboardShortcuts: () => [
    {
      id: "select-all",
      key: "a",
      ctrlOrCmdKey: true,
      description: "Select all nodes",
      handler: (editor, event) => {
        event.preventDefault();
        selectAllNodes(editor);
        return true;
      },
      priority: 100,
    },
    {
      id: "copy",
      key: "c",
      ctrlOrCmdKey: true,
      description: "Copy selected nodes",
      handler: (editor) => {
        const copied = copySelectedNodes(editor);
        copiedNodes = copied;
        return true;
      },
      priority: 100,
    },
    {
      id: "paste",
      key: "v",
      ctrlOrCmdKey: true,
      description: "Paste copied nodes",
      handler: (editor) => {
        pasteNodes(editor, copiedNodes);
        return true;
      },
      priority: 100,
    },
  ],
};
