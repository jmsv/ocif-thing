import type { UseOcifEditor } from "../hooks/useOcifEditor";
import type { CopiedNode } from "./types";

export const copySelectedNodes = (editor: UseOcifEditor): CopiedNode[] => {
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
