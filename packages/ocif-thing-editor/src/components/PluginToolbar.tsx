import * as Toggle from "@radix-ui/react-toggle";
import clsx from "clsx";

import type { UseOcifEditor } from "../hooks/useOcifEditor";
import type { PluginManager } from "../plugins/PluginManager";
import type { ToolbarItem } from "../plugins/types";

interface PluginToolbarProps {
  editor: UseOcifEditor;
  pluginManager: PluginManager;
}

export const PluginToolbar = ({
  editor,
  pluginManager,
}: PluginToolbarProps) => {
  const toolbarItems = pluginManager.getToolbarItems();

  const renderToolbarItem = (item: ToolbarItem) => {
    if (item.type === "toggle") {
      const isActive = item.isActive?.(editor) || false;
      const Icon = item.icon;

      return (
        <Toggle.Root
          key={item.id}
          pressed={isActive}
          onPressedChange={(pressed) => {
            if (pressed) {
              item.onClick?.(editor);
            }
          }}
          aria-label={item.tooltip || item.label}
          title={item.tooltip || item.label}
          className={clsx("ocif-toolbar-button", {
            "ocif-toolbar-button-pressed": isActive,
          })}
        >
          {item.shortcut && (
            <div className="ocif-toolbar-button-shortcut">{item.shortcut}</div>
          )}
          {Icon && <Icon />}
        </Toggle.Root>
      );
    }

    if (item.type === "button") {
      const Icon = item.icon;

      return (
        <button
          key={item.id}
          onClick={() => item.onClick?.(editor)}
          aria-label={item.tooltip || item.label}
          title={item.tooltip || item.label}
          className="ocif-toolbar-button"
        >
          {item.shortcut && (
            <div className="ocif-toolbar-button-shortcut">{item.shortcut}</div>
          )}
          {Icon && <Icon />}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="ocif-toolbar">{toolbarItems.map(renderToolbarItem)}</div>
  );
};
