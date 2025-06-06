import { nanoid } from "nanoid";

import type { CanvasEditor } from "../hooks/useCanvasEditor";
import type { OcifDocument } from "../schema";
import type { CopiedNode } from "./types";

export const pasteNodes = (
  editor: CanvasEditor,
  copiedNodes: CopiedNode[]
): void => {
  if (copiedNodes.length === 0) return;

  const newSelectedNodes = new Set<string>();
  const newNodes: Exclude<OcifDocument["nodes"], undefined> = [];
  const newResources: Exclude<OcifDocument["resources"], undefined> = [];

  copiedNodes.forEach(({ node, resource }) => {
    const newNode = {
      ...node,
      id: nanoid(),
      position: [
        (node.position?.[0] || 0) + 20,
        (node.position?.[1] || 0) + 20,
      ],
    };

    if (resource) {
      const newResource = {
        ...resource,
        id: nanoid(),
      };
      newResources.push(newResource);
      newNode.resource = newResource.id;
    }

    newNodes.push(newNode);
    newSelectedNodes.add(newNode.id);
  });

  editor.updateDocument((doc) => ({
    ...doc,
    nodes: [...(doc.nodes || []), ...newNodes],
    resources: [...(doc.resources || []), ...newResources],
  }));

  editor.setSelectedNodes(newSelectedNodes);
};
