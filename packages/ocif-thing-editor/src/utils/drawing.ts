import getStroke from "perfect-freehand";

export const getPerfectPointsFromPoints = (points: Array<[number, number]>) => {
  return getStroke(points, {
    size: 8,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
};

/**
 * Converts an array of points to an SVG path string
 * @param points Array of [x, y, pressure] points or [x, y] points
 * @param closed Whether to close the path
 * @returns SVG path string
 */
export function getSvgPathFromPoints(points: number[][], closed = true) {
  const len = points.length;

  if (len < 4) return "";

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let path = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    path += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `;
  }

  if (closed) {
    path += "Z";
  }

  return path;
}

/**
 * Calculates the average of two numbers
 */
const average = (a: number, b: number): number => (a + b) / 2;
