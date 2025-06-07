import type {
  OcifSchemaBase,
  OcifSchemaCoreOval,
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

  return null;
};
