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

export interface PropertyControl {
  id: string;
  label: string;
  component: React.ComponentType<{
    editor: UseOcifEditor;
    selectedNodes: Set<string>;
  }>;
  applicableToNodeTypes?: string[];
  priority?: number;
}

// Props that a node render component receives
export interface NodeRenderProps {
  node: Exclude<OcifSchemaBase["nodes"], undefined>[number];
  document: OcifSchemaBase;
  editor: UseOcifEditor;
}

// Union type for all possible property values
export type PropertyValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, unknown>
  | null
  | undefined;

// Schema for validating properties (JSON Schema-like)
export interface PropertySchema {
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  default?: PropertyValue;
  enum?: PropertyValue[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: PropertySchema; // For arrays
  properties?: Record<string, PropertySchema>; // For objects
}

export interface NodeTypeDefinition {
  type: string; // e.g., "@ocif/node/custom-widget"
  displayName: string;
  renderComponent: React.ComponentType<NodeRenderProps>;
  defaultProperties?: Record<string, PropertyValue>;
  propertySchema?: Record<string, PropertySchema>;
}

export interface ContextMenuContext {
  editor: UseOcifEditor;
  position: { x: number; y: number };
  selectedNodes: Set<string>;
  hoveredNode?: string;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  onClick?(context: ContextMenuContext): void;
  separator?: boolean;
  priority?: number;
}

export interface UIComponentContribution {
  id: string;
  component: React.ComponentType<{ editor: UseOcifEditor }>;
  position: "overlay" | "sidebar" | "bottom-panel" | "top-panel";
  priority?: number;
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
  addPropertyControls?(
    selectedNodes: Set<string>,
    editor: UseOcifEditor
  ): PropertyControl[];
  addNodeTypes?(): NodeTypeDefinition[];
  addContextMenuItems?(context: ContextMenuContext): ContextMenuItem[];
  addUIComponents?(): UIComponentContribution[];
  addKeyboardShortcuts?(): KeyboardShortcut[];

  // Plugin lifecycle
  onActivate?(editor: UseOcifEditor): void;
  onDeactivate?(editor: UseOcifEditor): void;
}
