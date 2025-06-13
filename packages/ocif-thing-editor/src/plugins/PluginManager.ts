import type { UseOcifEditor } from "../hooks/useOcifEditor";
import type {
  ContextMenuContext,
  ContextMenuItem,
  EditorEvent,
  EditorPlugin,
  KeyboardShortcut,
  NodeTypeDefinition,
  PropertyControl,
  ToolbarItem,
  UIComponentContribution,
} from "./types";

export class PluginManager {
  private plugins: EditorPlugin[] = [];

  register(plugin: EditorPlugin): void {
    this.plugins.push(plugin);
  }

  unregister(pluginName: string): void {
    const index = this.plugins.findIndex((p) => p.name === pluginName);
    if (index !== -1) {
      this.plugins.splice(index, 1);
    }
  }

  getPlugins(): EditorPlugin[] {
    return [...this.plugins];
  }

  // Event handling - core functionality
  handleEvent(event: EditorEvent): boolean {
    const handlers = this.plugins
      .map((p) => {
        switch (event.type) {
          case "mousedown":
            return p.onMouseDown;
          case "mousemove":
            return p.onMouseMove;
          case "mouseup":
            return p.onMouseUp;
          case "keydown":
            return p.onKeyDown;
          case "keyup":
            return p.onKeyUp;
          default:
            return undefined;
        }
      })
      .filter(
        (handler): handler is NonNullable<typeof handler> =>
          handler !== undefined
      )
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const handler of handlers) {
      if (handler(event)) {
        return true; // Plugin handled the event, stop propagation
      }
    }
    return false; // No plugin handled the event
  }

  // UI contribution methods
  getToolbarItems(): ToolbarItem[] {
    return this.plugins
      .flatMap((p) => p.addToolbarItems?.() || [])
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  getPropertyControls(
    selectedNodes: Set<string>,
    editor: UseOcifEditor
  ): PropertyControl[] {
    return this.plugins
      .flatMap((p) => p.addPropertyControls?.(selectedNodes, editor) || [])
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  getNodeTypes(): Map<string, NodeTypeDefinition> {
    const nodeTypes = new Map<string, NodeTypeDefinition>();
    for (const plugin of this.plugins) {
      for (const nodeType of plugin.addNodeTypes?.() || []) {
        nodeTypes.set(nodeType.type, nodeType);
      }
    }
    return nodeTypes;
  }

  getContextMenuItems(context: ContextMenuContext): ContextMenuItem[] {
    return this.plugins
      .flatMap((p) => p.addContextMenuItems?.(context) || [])
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  getUIComponents(): UIComponentContribution[] {
    return this.plugins
      .flatMap((p) => p.addUIComponents?.() || [])
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  getKeyboardShortcuts(): KeyboardShortcut[] {
    return this.plugins
      .flatMap((p) => p.addKeyboardShortcuts?.() || [])
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  handleKeyboardShortcut(
    event: React.KeyboardEvent,
    editor: UseOcifEditor
  ): boolean {
    const shortcuts = this.getKeyboardShortcuts();

    for (const shortcut of shortcuts) {
      const matchesKey = event.key === shortcut.key;
      const matchesShift =
        (shortcut.shiftKey || false) === (event.shiftKey || false);
      const matchesAlt = (shortcut.altKey || false) === (event.altKey || false);

      // Handle cross-platform modifier key (Ctrl on Windows/Linux, Cmd on Mac)
      const matchesCtrlOrCmd = shortcut.ctrlOrCmdKey
        ? event.ctrlKey || event.metaKey
        : !(event.ctrlKey || event.metaKey);

      if (matchesKey && matchesCtrlOrCmd && matchesShift && matchesAlt) {
        if (shortcut.handler(editor, event)) {
          return true; // Shortcut was handled, stop propagation
        }
      }
    }

    return false; // No shortcut matched or handled the event
  }

  // Plugin lifecycle management
  activatePlugins(editor: UseOcifEditor): void {
    for (const plugin of this.plugins) {
      plugin.onActivate?.(editor);
    }
  }

  deactivatePlugins(editor: UseOcifEditor): void {
    for (const plugin of this.plugins) {
      plugin.onDeactivate?.(editor);
    }
  }
}
