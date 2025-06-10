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
    <div className="app">
      <aside className="app-aside">
        <div className="app-aside-header">
          <h1 className="text-xl font-bold">ocif thing</h1>
        </div>

        <OcifJsonEditor value={value} onChange={setValue} />
      </aside>

      <OcifEditor editor={editor} />
    </div>
  );
}

export default App;
