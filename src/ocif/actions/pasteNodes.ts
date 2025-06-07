import { nanoid } from "nanoid";

import type { UseOcifEditor } from "../hooks/useOcifEditor";
import type { OcifSchemaBase } from "../schema";
import type { CopiedNode } from "./types";

export const pasteNodes = (
  editor: UseOcifEditor,
  copiedNodes: CopiedNode[]
): void => {
  if (copiedNodes.length === 0) return;

  const newSelectedNodes = new Set<string>();
  const newNodes: Exclude<OcifSchemaBase["nodes"], undefined> = [];
  const newResources: Exclude<OcifSchemaBase["resources"], undefined> = [];

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
