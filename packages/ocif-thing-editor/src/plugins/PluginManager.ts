import type { UseOcifEditor } from "../hooks/useOcifEditor";
import type {
  EditorEvent,
  EditorPlugin,
  KeyboardShortcut,
  NodeExtensionDefinition,
  ToolbarItem,
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

  getNodeExtensions(): Map<string, NodeExtensionDefinition> {
    const nodeExtensions = new Map<string, NodeExtensionDefinition>();
    for (const plugin of this.plugins) {
      for (const extension of plugin.addNodeExtensions?.() || []) {
        nodeExtensions.set(extension.type, extension);
      }
    }
    return nodeExtensions;
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
