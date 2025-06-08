import "./ocif/index.css";

import { useState } from "react";

import { OcifJsonEditor } from "./components/OcifJsonEditor";
import { OcifEditor, type OcifSchemaBase, useOcifEditor } from "./ocif";
import { exampleDefault } from "./ocif/examples/default";

function App() {
  const [value, setValue] = useState<OcifSchemaBase>(exampleDefault);

  const editor = useOcifEditor({
    document: value,
    onChange: setValue,
  });

  return (
    <div className="grid h-screen grid-cols-[380px_1fr] grid-rows-1">
      <div className="flex flex-col border-r">
        <div className="p-4">
          <h1 className="text-xl font-bold">ocif thing</h1>
        </div>

        <OcifJsonEditor value={value} onChange={setValue} />
      </div>

      <OcifEditor editor={editor} />
    </div>
  );
}

export default App;
