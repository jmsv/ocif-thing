import type { OcifSchemaBase } from "ocif-thing-schema";

export const exampleDefault: OcifSchemaBase = {
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
    {
      id: "n3",
      position: [423, 85],
      size: [8, 31],
      data: [
        {
          type: "@ocif/node/path",
          path: "M6.76,3.09 Q7.22,9.42 7.38,11.69 T7.73,17.44 8.01,24.23 8.01,28.12 7.63,29.24 6.91,30.19 5.93,30.86 4.78,31.18 3.59,31.12 2.49,30.68 1.58,29.91 0.97,28.89 0.71,27.73 0.84,26.54 1.33,25.46 2.15,24.60 3.20,24.04 4.38,23.85 5.55,24.04 6.60,24.59 7.42,25.46 7.92,26.54 8.05,27.72 7.80,28.88 7.19,29.90 6.28,30.67 5.18,31.12 3.99,31.18 2.84,30.86 1.85,30.20 1.13,29.25 0.75,28.12 0.65,27.53 0.72,24.28 0.82,17.68 0.78,12.17 0.35,6.86 0.01,3.29 0.13,2.49 0.45,1.74 0.93,1.08 1.55,0.56 2.28,0.21 3.08,0.04 3.89,0.06 4.67,0.28 5.38,0.68 5.97,1.24 6.41,1.92 6.68,2.69 Z",
          fillColor: "#000",
        },
      ],
    },
    {
      id: "n4",
      position: [448, 86],
      size: [9, 35],
      data: [
        {
          type: "@ocif/node/path",
          path: "M8.26,3.15 Q8.70,9.49 8.86,11.75 T9.21,17.10 9.50,22.53 9.25,26.95 8.34,31.09 7.50,33.71 6.74,34.74 5.69,35.46 4.46,35.81 3.18,35.75 1.99,35.29 1.01,34.47 0.35,33.39 0.06,32.14 0.19,30.87 0.71,29.71 1.58,28.77 2.71,28.17 3.97,27.95 5.23,28.14 6.36,28.73 7.25,29.65 7.79,30.81 7.94,32.07 7.68,33.32 7.03,34.42 6.06,35.26 4.88,35.74 3.60,35.82 2.37,35.49 1.31,34.78 0.53,33.77 0.11,32.56 0.10,31.29 0.20,30.65 1.10,27.74 2.09,22.56 2.20,17.34 2.16,12.24 1.72,6.93 1.37,3.36 1.50,2.54 1.82,1.77 2.31,1.11 2.94,0.57 3.69,0.21 4.50,0.04 5.33,0.06 6.13,0.29 6.85,0.69 7.45,1.26 7.90,1.96 8.18,2.74 Z",
          fillColor: "#000",
        },
      ],
    },
    {
      id: "n5",
      position: [401, 112],
      size: [70, 53],
      data: [
        {
          type: "@ocif/node/path",
          path: "M7.95,3.40 Q6.00,11.40 5.74,13.64 T5.95,19.36 7.21,24.71 9.33,28.62 12.58,32.93 17.70,38.20 24.08,42.98 30.59,46.10 38.83,48.02 47.33,48.84 53.03,48.54 57.08,47.19 61.12,44.99 64.50,42.23 66.21,40.58 67.08,40.18 68.02,40.08 68.95,40.29 69.76,40.78 70.38,41.50 70.73,42.39 70.78,43.34 70.52,44.25 69.99,45.04 69.23,45.61 68.33,45.91 67.38,45.91 66.48,45.61 65.72,45.03 65.19,44.24 64.94,43.33 64.99,42.38 65.34,41.49 65.96,40.77 66.77,40.28 67.70,40.08 68.65,40.18 69.51,40.58 70.20,41.24 70.64,42.08 70.80,43.02 70.64,43.96 70.19,44.80 69.90,45.18 68.06,46.78 63.56,49.96 58.51,52.27 53.38,53.40 46.93,53.55 37.67,52.71 28.47,50.73 21.02,47.38 13.50,42.33 7.54,36.66 3.69,31.47 1.26,26.54 0.23,19.61 0.46,12.65 1.68,6.27 2.54,1.90 2.84,1.29 3.27,0.77 3.82,0.37 4.44,0.11 5.11,0.01 5.78,0.07 6.42,0.29 6.98,0.66 7.45,1.15 7.78,1.74 7.96,2.39 7.98,3.06 Z",
          fillColor: "#000",
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
