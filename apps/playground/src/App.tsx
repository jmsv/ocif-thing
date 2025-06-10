import "ocif-thing-editor/styles.css";

import { useState } from "react";

import { OcifEditor, useOcifEditor } from "ocif-thing-editor";
import { exampleDefault } from "ocif-thing-examples";
import type { OcifSchemaBase } from "ocif-thing-schema";

import { OcifJsonEditor } from "./OcifJsonEditor";

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
          <h1>
            <img src="/icon.svg" alt="ocif icon" />
            ocif thing playground
          </h1>
        </div>

        <OcifJsonEditor value={value} onChange={setValue} />
      </aside>

      <OcifEditor editor={editor} />
    </div>
  );
}

export default App;
