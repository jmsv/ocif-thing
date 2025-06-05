import type { OcifCoreRect, OcifDocument } from "../schema";
import { baseNodeStyles } from "../utils/node";

export const NodeExtension = ({
  node,
  extension,
}: {
  node: Exclude<OcifDocument["nodes"], undefined>[number];
  extension: { type: string };
}) => {
  if (!node.size || node.size.length < 2) {
    return null;
  }

  if (extension.type === "@ocif/node/rect") {
    const extensionRect = extension as OcifCoreRect;

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

  return null;
};
