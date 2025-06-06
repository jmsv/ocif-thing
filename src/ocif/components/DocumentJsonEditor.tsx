import { Editor } from "@monaco-editor/react";

import { type OcifDocument, validateOcifBase } from "../schema";

interface DocumentJsonEditorProps {
  value: OcifDocument;
  onChange: (value: OcifDocument) => void;
}

export function DocumentJsonEditor({
  value,
  onChange,
}: DocumentJsonEditorProps) {
  const handleChange = (newValue: string | undefined) => {
    if (!newValue) return;

    try {
      const parsed = JSON.parse(newValue) as unknown;
      if (validateOcifBase(parsed)) {
        onChange(parsed as OcifDocument);
      } else {
        console.error("Invalid OCIF document:", validateOcifBase.errors);
      }
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  return (
    <div className="w-full flex-1 border-t py-2">
      <Editor
        language="json"
        value={JSON.stringify(value, null, 2)}
        onChange={handleChange}
        options={{
          fontSize: 12,
          lineNumbers: "off",
          scrollBeyondLastLine: false,
          formatOnPaste: true,
          formatOnType: true,
          folding: false,
          glyphMargin: false,
          cursorSmoothCaretAnimation: "on",
          minimap: { enabled: false },
          tabSize: 2,
        }}
      />
    </div>
  );
}
