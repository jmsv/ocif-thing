import type { OcifDocument } from "../schema";

export interface CopiedNode {
  node: Exclude<OcifDocument["nodes"], undefined>[number];
  resource?: Exclude<OcifDocument["resources"], undefined>[number];
}
