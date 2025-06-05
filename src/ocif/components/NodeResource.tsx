import type { OcifDocument } from "../schema";
import { baseNodeStyles } from "../utils/node";

export const NodeResource = ({
  node,
  resource,
}: {
  node: Exclude<OcifDocument["nodes"], undefined>[number];
  resource: Exclude<OcifDocument["resources"], undefined>[number];
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
              style={{
                ...baseNodeStyles,
                width: node.size[0],
                height: node.size[1],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
