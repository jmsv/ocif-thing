import type { CanvasEditor } from "../hooks/useCanvasEditor";

export const moveSelectedNodes = (
  editor: CanvasEditor,
  direction: "up" | "down" | "left" | "right",
  amount: number = 1
): void => {
  if (editor.selectedNodes.size === 0) return;

  let dx = 0;
  let dy = 0;

  switch (direction) {
    case "up":
      dy = -amount;
      break;
    case "down":
      dy = amount;
      break;
    case "left":
      dx = -amount;
      break;
    case "right":
      dx = amount;
      break;
  }

  editor.updateDocument((doc) => ({
    ...doc,
    nodes:
      doc.nodes?.map((node) => {
        if (editor.selectedNodes.has(node.id)) {
          const [x, y] = node.position || [0, 0];
          return {
            ...node,
            position: [x + dx, y + dy],
          };
        }
        return node;
      }) || [],
  }));
};
