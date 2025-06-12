import clsx from "clsx";
import type { OcifSchemaBase } from "ocif-thing-schema";

import type { UseOcifEditor } from "../hooks/useOcifEditor";
import { baseNodeStyles } from "../utils/node";
import { NodeExtension } from "./NodeExtension";
import { NodeResource } from "./NodeResource";

interface NodeContainerProps {
  node: Exclude<OcifSchemaBase["nodes"], undefined>[number];
  document: OcifSchemaBase;
  editor: UseOcifEditor;
}

export const NodeContainer = ({
  node,
  document,
  editor,
}: NodeContainerProps) => {
  const { selectedNodes, setSelectedNodes, mode, startNodeDrag } = editor;

  if (
    !node.size ||
    node.size.length < 2 ||
    !node.position ||
    node.position.length < 2
  ) {
    return null;
  }

  const extensions = (node.data ?? []) as { type: string }[];
  const resource = document.resources?.find((r) => r.id === node.resource);
  const isSelected = selectedNodes.has(node.id);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== "select") return;

    e.stopPropagation();

    if (!isSelected && !(e.ctrlKey || e.metaKey)) {
      const newSelection = new Set<string>();
      newSelection.add(node.id);
      setSelectedNodes(newSelection);
    }

    const nodesToDrag = isSelected ? selectedNodes : new Set([node.id]);
    const nodePositions = new Map<string, number[]>();

    document.nodes?.forEach((n) => {
      if (nodesToDrag.has(n.id) && n.position && n.position.length >= 2) {
        nodePositions.set(n.id, [...n.position]);
      }
    });

    startNodeDrag(node.id, e, nodePositions);
  };

  return (
    <div
      className={clsx("ocif-node", { "ocif-node-selected": isSelected })}
      style={{
        ...baseNodeStyles,
        width: node.size[0],
        height: node.size[1],
        transform: `translate(${node.position[0]}px, ${node.position[1]}px) rotate(${node.rotation ?? 0}deg)`,
        cursor: mode === "select" ? "pointer" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          position: "relative",
          width: node.size[0],
          height: node.size[1],
        }}
      >
        {extensions.map((extension) => (
          <NodeExtension
            key={extension.type}
            node={node}
            extension={extension}
          />
        ))}

        {resource ? <NodeResource node={node} resource={resource} /> : null}
      </div>
    </div>
  );
};
