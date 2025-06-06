import type { CanvasEditor } from "../hooks/useCanvasEditor";

export const selectAllNodes = (editor: CanvasEditor): void => {
  const allNodeIds = new Set(
    editor.document.nodes?.map((node) => node.id) || []
  );
  editor.setSelectedNodes(allNodeIds);
};
