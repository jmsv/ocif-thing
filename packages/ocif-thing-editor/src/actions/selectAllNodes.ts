import type { UseOcifEditor } from "../hooks/useOcifEditor";

export const selectAllNodes = (editor: UseOcifEditor): void => {
  const allNodeIds = new Set(
    editor.document.nodes?.map((node) => node.id) || []
  );
  editor.setSelectedNodes(allNodeIds);
};
