import type { OcifDocument } from "../schema";

export type CanvasMode = "select" | "hand" | "rectangle";

export interface CopiedNode {
  node: Exclude<OcifDocument["nodes"], undefined>[number];
  resource?: Exclude<OcifDocument["resources"], undefined>[number];
}
