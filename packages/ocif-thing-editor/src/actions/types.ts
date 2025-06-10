import type { OcifSchemaBase } from "ocif-thing-schema";

export interface CopiedNode {
  node: Exclude<OcifSchemaBase["nodes"], undefined>[number];
  resource?: Exclude<OcifSchemaBase["resources"], undefined>[number];
}
