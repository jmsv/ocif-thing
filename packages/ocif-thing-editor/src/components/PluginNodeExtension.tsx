import type { OcifSchemaBase } from "ocif-thing-schema";

import type { UseOcifEditor } from "../hooks/useOcifEditor";
import type { PluginManager } from "../plugins/PluginManager";

interface PluginNodeExtensionProps {
  node: Exclude<OcifSchemaBase["nodes"], undefined>[number];
  extension: { type: string } & Record<string, unknown>;
  document: OcifSchemaBase;
  editor: UseOcifEditor;
  pluginManager: PluginManager;
}

export const PluginNodeExtension = ({
  node,
  extension,
  document,
  editor,
  pluginManager,
}: PluginNodeExtensionProps) => {
  const nodeExtensions = pluginManager.getNodeExtensions();
  const extensionDefinition = nodeExtensions.get(extension.type);

  if (!extensionDefinition) return null;

  const ExtensionComponent = extensionDefinition.renderComponent;

  return (
    <ExtensionComponent
      node={node}
      extension={extension}
      document={document}
      editor={editor}
    />
  );
};
