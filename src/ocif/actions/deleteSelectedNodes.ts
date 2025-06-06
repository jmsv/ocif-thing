import type { CanvasEditor } from "../hooks/useCanvasEditor";

export const deleteSelectedNodes = (editor: CanvasEditor): void => {
  if (editor.selectedNodes.size === 0) return;

  const resourcesToDelete = new Set(
    editor.document.nodes
      ?.filter((node) => editor.selectedNodes.has(node.id))
      .map((node) => node.resource)
      .filter((id): id is string => id !== undefined)
  );

  editor.updateDocument((doc) => ({
    ...doc,
    nodes:
      doc.nodes?.filter((node) => !editor.selectedNodes.has(node.id)) || [],
    resources:
      doc.resources?.filter(
        (resource) => !resourcesToDelete.has(resource.id)
      ) || [],
  }));

  editor.setSelectedNodes(new Set());
};
