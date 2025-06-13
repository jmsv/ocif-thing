import type { UseOcifEditor } from "../hooks/useOcifEditor";
import {
  getRelativeMousePosition,
  screenToCanvasPosition,
} from "../utils/coordinates";

// Rotation actions
export const updateRotation = (editor: UseOcifEditor, e: React.MouseEvent) => {
  const container = editor.canvasRef.current;
  if (!container) return;

  const { x: clientX, y: clientY } = getRelativeMousePosition(e, container);
  const { x: canvasX, y: canvasY } = screenToCanvasPosition(
    clientX,
    clientY,
    editor.editorState.position,
    editor.editorState.scale
  );

  editor.setEditorState((prev) => {
    if (!prev.isRotating) return prev;

    // Calculate current vector from center to mouse
    const currentVector = {
      x: canvasX - prev.rotationCenter.x,
      y: canvasY - prev.rotationCenter.y,
    };

    // Calculate current angle
    const currentAngle = Math.atan2(currentVector.y, currentVector.x);

    // Calculate total angle difference from initial angle
    let totalRotation =
      (currentAngle - prev.initialRotationAngle) * (180 / Math.PI);

    // Normalize angle to -180 to 180 range
    while (totalRotation > 180) totalRotation -= 360;
    while (totalRotation < -180) totalRotation += 360;

    // Apply rotation to all selected nodes based on their initial states
    const nodeUpdates = new Map();

    prev.initialNodeStates.forEach((initialState, nodeId) => {
      const node = editor.document.nodes?.find((n) => n.id === nodeId);

      if (node && node.size && node.size.length >= 2) {
        // Calculate new rotation and normalize to 0-360 range
        const rawRotation = initialState.rotation + totalRotation;
        let newRotation = ((rawRotation % 360) + 360) % 360;

        // Only apply snapping if we're rotating a single node
        if (prev.initialNodeStates.size === 1) {
          const snapThreshold = 10; // degrees
          const snapAngles = [0, 90, 180, 270, 360];

          // Find the closest snap angle, considering wrap-around
          const closestSnapAngle = snapAngles.reduce((closest, snapAngle) => {
            // Calculate the shortest distance between angles using modulo
            const diff = Math.abs(
              ((newRotation - snapAngle + 180) % 360) - 180
            );
            const closestDiff = Math.abs(
              ((newRotation - closest + 180) % 360) - 180
            );
            return diff < closestDiff ? snapAngle : closest;
          });

          // If within threshold, snap to the closest angle
          const diff = Math.abs(
            ((newRotation - closestSnapAngle + 180) % 360) - 180
          );
          if (diff <= snapThreshold) {
            // Use 0 instead of 360 for consistency
            newRotation = closestSnapAngle === 360 ? 0 : closestSnapAngle;
          }
        }

        // Calculate initial node center
        const initialNodeCenter = {
          x: initialState.position[0] + node.size[0] / 2,
          y: initialState.position[1] + node.size[1] / 2,
        };

        // Calculate vector from rotation center to initial node center
        const vector = {
          x: initialNodeCenter.x - prev.rotationCenter.x,
          y: initialNodeCenter.y - prev.rotationCenter.y,
        };

        // Rotate the vector by total rotation
        const rad = (totalRotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const rotatedVector = {
          x: vector.x * cos - vector.y * sin,
          y: vector.x * sin + vector.y * cos,
        };

        // Calculate new node center
        const newNodeCenter = {
          x: prev.rotationCenter.x + rotatedVector.x,
          y: prev.rotationCenter.y + rotatedVector.y,
        };

        // Calculate new position (top-left corner)
        const newPosition = [
          newNodeCenter.x - node.size[0] / 2,
          newNodeCenter.y - node.size[1] / 2,
        ];

        nodeUpdates.set(nodeId, {
          position: newPosition,
          rotation: newRotation,
        });
      }
    });

    // Apply all updates in a single document update
    if (nodeUpdates.size > 0) {
      // Use requestAnimationFrame to batch updates and prevent rapid state changes
      editor.updateDocument((doc) => ({
        ...doc,
        nodes: doc.nodes?.map((node) => {
          const update = nodeUpdates.get(node.id);
          return update
            ? {
                ...node,
                position: update.position,
                rotation: update.rotation,
              }
            : node;
        }),
      }));
    }

    return prev;
  });
};

export const finishRotation = (editor: UseOcifEditor) => {
  editor.setEditorState((prev) => {
    // Round positions and rotations when finishing rotation
    if (prev.isRotating && prev.initialNodeStates.size > 0) {
      editor.updateDocument((doc) => ({
        ...doc,
        nodes: doc.nodes?.map((node) => {
          if (prev.initialNodeStates.has(node.id)) {
            return {
              ...node,
              position: node.position
                ? [Math.round(node.position[0]), Math.round(node.position[1])]
                : node.position,
              rotation:
                node.rotation !== undefined
                  ? ((Math.round(node.rotation) % 360) + 360) % 360
                  : node.rotation,
            };
          }
          return node;
        }),
      }));
    }

    return {
      ...prev,
      isRotating: false,
      rotationStart: { x: 0, y: 0 },
      rotationCenter: { x: 0, y: 0 },
      initialRotationAngle: 0,
      initialNodeStates: new Map(),
    };
  });
};
