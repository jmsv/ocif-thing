import type { OcifSchemaBase } from "../schema";
import { baseNodeStyles } from "../utils/node";

export const NodeResource = ({
  node,
  resource,
}: {
  node: Exclude<OcifSchemaBase["nodes"], undefined>[number];
  resource: Exclude<OcifSchemaBase["resources"], undefined>[number];
}) => {
  return (
    <>
      {resource.representations.map((rep) => {
        if (!node.size || node.size.length < 2) {
          return null;
        }

        if (rep.mimeType === "text/plain") {
          return (
            <div
              key={`${node.id}-${resource.id}`}
              style={{
                ...baseNodeStyles,
                width: node.size[0],
                height: node.size[1],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                textWrap: "balance",
              }}
            >
              {rep.content}
            </div>
          );
        }

        return null;
      })}
    </>
  );
};
