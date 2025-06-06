import { useState } from "react";

import { DocumentCanvas } from "./ocif/components/DocumentCanvas";
import { DocumentJsonEditor } from "./ocif/components/DocumentJsonEditor";
import { exampleHelloWorld } from "./ocif/examples/hello-world";
import { useCanvasEditor } from "./ocif/hooks/useCanvasEditor";
import type { OcifDocument } from "./ocif/schema";

function App() {
  const [value, setValue] = useState<OcifDocument>(exampleHelloWorld);

  const editor = useCanvasEditor({
    document: value,
    onChange: setValue,
  });

  return (
    <div className="grid h-screen grid-cols-[380px_1fr] grid-rows-1">
      <div className="flex flex-col border-r">
        <div className="p-4">
          <h1 className="text-xl font-bold">ocif thing</h1>
        </div>

        <DocumentJsonEditor value={value} onChange={setValue} />
      </div>

      <div className="relative">
        <DocumentCanvas editor={editor} />
      </div>
    </div>
  );
}

export default App;
