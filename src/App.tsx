import { useState } from "react";

import { DocumentCanvas } from "./ocif/components/DocumentCanvas";
import { DocumentJsonEditor } from "./ocif/components/DocumentJsonEditor";
import { exampleHelloWorld } from "./ocif/examples/hello-world";
import type { OcifDocument } from "./ocif/schema";

function App() {
  const [value, setValue] = useState<OcifDocument>(exampleHelloWorld);

  return (
    <div className="grid h-screen grid-cols-[400px_1fr] grid-rows-1">
      <div className="flex flex-col border-r">
        <div className="p-4">
          <h1 className="text-xl font-bold">ocif thing</h1>
        </div>

        <DocumentJsonEditor value={value} onChange={setValue} />
      </div>

      <div className="relative">
        <DocumentCanvas document={value} />
      </div>
    </div>
  );
}

export default App;
