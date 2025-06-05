import { useCanvasContext } from "../hooks/useCanvasContext";
import type { OcifDocument } from "../schema";
import { CanvasProvider } from "./CanvasProvider";
import { NodeContainer } from "./NodeContainer";
import { Toolbar } from "./Toolbar";
import { ZoomControls } from "./ZoomControls";

interface DocumentCanvasProps {
  document: OcifDocument;
}

const CanvasContent = ({ document }: DocumentCanvasProps) => {
  const { transform } = useCanvasContext();

  return (
    <div className="absolute" style={{ transform }}>
      <div className="relative">
        {document.nodes?.map((node) => (
          <NodeContainer key={node.id} node={node} document={document} />
        ))}
      </div>
    </div>
  );
};

export const DocumentCanvas = ({ document }: DocumentCanvasProps) => {
  return (
    <CanvasProvider>
      <CanvasContent document={document} />
      <ZoomControls />
      <Toolbar />
    </CanvasProvider>
  );
};
