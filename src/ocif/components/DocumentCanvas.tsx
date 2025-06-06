import { nanoid } from "nanoid";

import type { SelectionRectangle } from "../contexts/CanvasContext";
import { useCanvasContext } from "../hooks/useCanvasContext";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import type { OcifDocument } from "../schema";
import { CanvasProvider } from "./CanvasProvider";
import { NodeContainer } from "./NodeContainer";
import { SelectionBounds } from "./SelectionBounds";
import { Toolbar } from "./Toolbar";
import { ZoomControls } from "./ZoomControls";

interface DocumentCanvasProps {
  document: OcifDocument;
  setValue: React.Dispatch<React.SetStateAction<OcifDocument>>;
}

const CanvasContent = ({ document, setValue }: DocumentCanvasProps) => {
  const {
    transform,
    selectionRectangle,
    drawingRectangle,
    position,
    scale,
    selectedNodes,
    setSelectedNodes,
  } = useCanvasContext();

  useKeyboardShortcuts({
    document,
    setValue,
    selectedNodes,
    setSelectedNodes,
  });

  const updateNodeGeometry = (
    nodeId: string,
    position: number[],
    size: number[]
  ) => {
    setValue((prevValue) => ({
      ...prevValue,
      nodes: prevValue.nodes?.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              position,
              ...(size.length > 0 ? { size } : {}),
            }
          : node
      ),
    }));
  };

  const getRectangleStyle = (rectangle: SelectionRectangle) => ({
    left: Math.min(rectangle.startX, rectangle.endX) * scale + position.x,
    top: Math.min(rectangle.startY, rectangle.endY) * scale + position.y,
    width: Math.abs(rectangle.endX - rectangle.startX) * scale,
    height: Math.abs(rectangle.endY - rectangle.startY) * scale,
  });

  return (
    <div className="absolute inset-0">
      <div className="absolute" style={{ transform }}>
        <div className="relative">
          {document.nodes?.map((node) => (
            <NodeContainer key={node.id} node={node} document={document} />
          ))}
        </div>
      </div>

      {selectionRectangle && (
        <div
          className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/10"
          style={getRectangleStyle(selectionRectangle)}
        />
      )}

      {drawingRectangle && (
        <div
          className="pointer-events-none absolute border-2 border-black bg-white opacity-50"
          style={getRectangleStyle(drawingRectangle)}
        />
      )}

      <SelectionBounds
        document={document}
        onUpdateNodeGeometry={updateNodeGeometry}
      />
    </div>
  );
};

export const DocumentCanvas = ({ document, setValue }: DocumentCanvasProps) => {
  const updateNodeGeometry = (
    nodeId: string,
    position: number[],
    size: number[]
  ) => {
    setValue((prevValue) => ({
      ...prevValue,
      nodes: prevValue.nodes?.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              position,
              ...(size.length > 0 ? { size } : {}),
            }
          : node
      ),
    }));
  };

  const createRectangleNode = (bounds: SelectionRectangle) => {
    const minX = Math.min(bounds.startX, bounds.endX);
    const minY = Math.min(bounds.startY, bounds.endY);
    const width = Math.abs(bounds.endX - bounds.startX);
    const height = Math.abs(bounds.endY - bounds.startY);

    const newNode = {
      id: nanoid(),
      position: [minX, minY],
      size: [width, height],
      data: [
        {
          type: "@ocif/node/rect",
          strokeWidth: 2,
          strokeColor: "#000",
          fillColor: "#fff",
        },
      ],
    };

    setValue((prevValue) => ({
      ...prevValue,
      nodes: [...(prevValue.nodes || []), newNode],
    }));
  };

  return (
    <CanvasProvider
      document={document}
      onUpdateNodeGeometry={updateNodeGeometry}
      onCreateRectangleNode={createRectangleNode}
    >
      <CanvasContent document={document} setValue={setValue} />
      <ZoomControls />
      <Toolbar />
    </CanvasProvider>
  );
};
