import type { OcifSchemaBase } from "ocif-thing-schema";

import type { UseOcifEditor } from "../hooks/useOcifEditor";

export interface EditorEvent {
  type: "mousedown" | "mousemove" | "mouseup" | "keydown" | "keyup";
  originalEvent: React.MouseEvent | React.KeyboardEvent;
  editor: UseOcifEditor;
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  ctrlOrCmdKey?: boolean; // Works with Ctrl (Windows/Linux) or Cmd (Mac)
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  handler: (editor: UseOcifEditor, event: React.KeyboardEvent) => boolean; // true = handled, false = continue
  priority?: number;
}

export interface PluginEventHandler {
  priority?: number; // Higher = earlier in chain
  (event: EditorEvent): boolean; // true = handled, stop propagation, false = continue to next plugin
}

export interface ToolbarItem {
  id: string;
  type: "button" | "toggle";
  icon?: React.ComponentType;
  label: string;
  tooltip?: string;
  shortcut?: string; // Keyboard shortcut key to display
  isActive?(editor: UseOcifEditor): boolean;
  onClick?(editor: UseOcifEditor): void;
  group?: string; // For organizing toolbar sections
  priority?: number;
}

// Node extension definition for OCIF-compliant extension rendering
export interface NodeExtensionDefinition {
  type: string; // e.g., "@ocif/node/rect", "@ocif/node/oval"
  displayName: string;
  renderComponent: React.ComponentType<{
    node: Exclude<OcifSchemaBase["nodes"], undefined>[number];
    extension: Record<string, unknown>; // The extension data from node.data[]
    document: OcifSchemaBase;
    editor: UseOcifEditor;
  }>;
}

export interface EditorPlugin {
  name: string;

  // Event handling
  onMouseDown?: PluginEventHandler;
  onMouseMove?: PluginEventHandler;
  onMouseUp?: PluginEventHandler;
  onKeyDown?: PluginEventHandler;
  onKeyUp?: PluginEventHandler;

  // UI contributions
  addToolbarItems?(): ToolbarItem[];
  addNodeExtensions?(): NodeExtensionDefinition[]; // OCIF-compliant extensions
  addKeyboardShortcuts?(): KeyboardShortcut[];

  // Plugin lifecycle
  onActivate?(editor: UseOcifEditor): void;
  onDeactivate?(editor: UseOcifEditor): void;
}
