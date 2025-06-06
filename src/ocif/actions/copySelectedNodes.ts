import type { CanvasEditor } from "../hooks/useCanvasEditor";
import type { CopiedNode } from "./types";

export const copySelectedNodes = (editor: CanvasEditor): CopiedNode[] => {
  const nodesToCopy =
    editor.document.nodes?.filter((node) =>
      editor.selectedNodes.has(node.id)
    ) || [];
  return nodesToCopy.map((node) => {
    const resource = node.resource
      ? editor.document.resources?.find((r) => r.id === node.resource)
      : undefined;
    return { node, resource };
  });
};
