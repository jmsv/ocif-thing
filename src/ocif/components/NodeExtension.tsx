import { useRef } from "react";

import type {
  OcifSchemaBase,
  OcifSchemaCoreOval,
  OcifSchemaCorePath,
  OcifSchemaCoreRect,
} from "../schema";
import { baseNodeStyles } from "../utils/node";

export const NodeExtension = ({
  node,
  extension,
}: {
  node: Exclude<OcifSchemaBase["nodes"], undefined>[number];
  extension: { type: string };
}) => {
  if (!node.size || node.size.length < 2) {
    return null;
  }

  if (extension.type === "@ocif/node/rect") {
    const extensionRect = extension as OcifSchemaCoreRect;

    return (
      <div
        style={{
          ...baseNodeStyles,
          width: node.size[0],
          height: node.size[1],
          borderWidth: extensionRect.strokeWidth,
          borderColor: extensionRect.strokeColor,
          backgroundColor: extensionRect.fillColor,
        }}
      />
    );
  }

  if (extension.type === "@ocif/node/oval") {
    const extensionOval = extension as OcifSchemaCoreOval;

    return (
      <div
        style={{
          ...baseNodeStyles,
          width: node.size[0],
          height: node.size[1],
          borderWidth: extensionOval.strokeWidth,
          borderColor: extensionOval.strokeColor,
          backgroundColor: extensionOval.fillColor,
          borderRadius: "50%",
        }}
      />
    );
  }

  if (extension.type === "@ocif/node/path") {
    // TODO: This isn't working without `as unknown` because `OcifSchemaCorePath` doesn't have a `type` property
    const extensionPath = extension as unknown as OcifSchemaCorePath;

    return <NodeCorePath node={node} extension={extensionPath} />;
  }

  return null;
};

const NodeCorePath = ({
  node,
  extension,
}: {
  node: Exclude<OcifSchemaBase["nodes"], undefined>[number];
  extension: OcifSchemaCorePath;
}) => {
  const pathRef = useRef<SVGPathElement>(null);

  if (!node.size || node.size.length < 2) {
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${pathRef.current?.getBBox().width} ${pathRef.current?.getBBox().height}`}
      style={{
        ...baseNodeStyles,
        width: node.size[0],
        height: node.size[1],
        overflow: "visible",
      }}
      className="object-scale-down"
      preserveAspectRatio="none"
    >
      <path
        ref={pathRef}
        d={extension.path}
        stroke={extension.strokeColor}
        strokeWidth={extension.strokeWidth}
        fill={extension.fillColor}
      />
    </svg>
  );
};
