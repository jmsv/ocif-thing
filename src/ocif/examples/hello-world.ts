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
    {
      id: "n2",
      position: [250, 150],
      size: [133, 100],
      data: [
        {
          type: "@ocif/node/oval",
          strokeWidth: 3,
          strokeColor: "#ff0000",
          fillColor: "#ff000055",
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
