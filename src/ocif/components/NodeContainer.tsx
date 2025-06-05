import type { OcifDocument } from "../schema";
import { baseNodeStyles } from "../utils/node";
import { NodeExtension } from "./NodeExtension";
import { NodeResource } from "./NodeResource";

interface NodeContainerProps {
  node: Exclude<OcifDocument["nodes"], undefined>[number];
  document: OcifDocument;
}

export const NodeContainer = ({ node, document }: NodeContainerProps) => {
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

  return (
    <div
      style={{
        ...baseNodeStyles,
        width: node.size[0],
        height: node.size[1],
        transform: `translate(${node.position[0]}px, ${node.position[1]}px)`,
      }}
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
