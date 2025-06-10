import { Editor } from "@monaco-editor/react";

import { type OcifSchemaBase, validateOcifBase } from "../ocif";

export const OcifJsonEditor = ({
  value,
  onChange,
}: {
  value: OcifSchemaBase;
  onChange: (value: OcifSchemaBase) => void;
}) => {
  const handleChange = (newValue: string | undefined) => {
    if (!newValue) return;

    try {
      const parsed = JSON.parse(newValue) as unknown;
      if (validateOcifBase(parsed)) {
        onChange(parsed as OcifSchemaBase);
      } else {
        console.error("Invalid OCIF document:", validateOcifBase.errors);
      }
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  return (
    <div className="ocif-json-editor">
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
};
