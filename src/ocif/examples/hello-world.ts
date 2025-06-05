// https://github.com/ocwg/spec/blob/main/spec/v0.5/spec.md#hello-world-example
import type { OcifDocument } from "../schema";

export const exampleHelloWorld: OcifDocument = {
  ocif: "https://canvasprotocol.org/ocif/v0.5",
  nodes: [
    {
      id: "n1",
      position: [100, 100],
      size: [200, 100],
      resource: "r1",
      data: [
        {
          type: "@ocif/node/rect",
          strokeWidth: 3,
          strokeColor: "#000",
          fillColor: "#fff",
        },
      ],
    },
  ],
  resources: [
    {
      id: "r1",
      representations: [
        {
          mimeType: "text/plain",
          content: "hello, world!",
        },
      ],
    },
  ],
};
