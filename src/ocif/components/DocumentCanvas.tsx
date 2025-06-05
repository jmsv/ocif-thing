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
    position,
    scale,
    handleMouseUp,
    selectedNodes,
    setSelectedNodes,
  } = useCanvasContext();

  useKeyboardShortcuts({
    document,
    setValue,
    selectedNodes,
    setSelectedNodes,
  });

  const handleCanvasMouseUp = () => {
    const nodes =
      document.nodes?.map((node) => ({
        id: node.id,
        position: node.position || [0, 0],
        size: node.size || [0, 0],
      })) || [];
    handleMouseUp(nodes);
  };

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

  return (
    <div className="absolute inset-0" onMouseUp={handleCanvasMouseUp}>
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
          style={{
            left:
              Math.min(selectionRectangle.startX, selectionRectangle.endX) *
                scale +
              position.x,
            top:
              Math.min(selectionRectangle.startY, selectionRectangle.endY) *
                scale +
              position.y,
            width:
              Math.abs(selectionRectangle.endX - selectionRectangle.startX) *
              scale,
            height:
              Math.abs(selectionRectangle.endY - selectionRectangle.startY) *
              scale,
          }}
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

  return (
    <CanvasProvider onUpdateNodeGeometry={updateNodeGeometry}>
      <CanvasContent document={document} setValue={setValue} />
      <ZoomControls />
      <Toolbar />
    </CanvasProvider>
  );
};
