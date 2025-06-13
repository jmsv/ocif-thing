import { useMemo } from "react";

import { PluginManager } from "../plugins/PluginManager";
import { canvasDragPlugin } from "../plugins/canvasDragPlugin";
import { clipboardPlugin } from "../plugins/clipboardPlugin";
import { deletePlugin } from "../plugins/deletePlugin";
import { handToolPlugin } from "../plugins/handToolPlugin";
import { movementPlugin } from "../plugins/movementPlugin";
import { nodeDraggingPlugin } from "../plugins/nodeDraggingPlugin";
import { ovalNodePlugin } from "../plugins/ovalNodePlugin";
import { pathNodePlugin } from "../plugins/pathNodePlugin";
import { rectangleNodePlugin } from "../plugins/rectangleNodePlugin";
import { rotationPlugin } from "../plugins/rotationPlugin";
import { selectToolPlugin } from "../plugins/selectToolPlugin";
import { selectionPlugin } from "../plugins/selectionPlugin";
import type { EditorPlugin } from "../plugins/types";
import { zoomPlugin } from "../plugins/zoomPlugin";

interface UsePluginsOptions {
  additionalPlugins?: EditorPlugin[];
}

export const usePlugins = ({
  additionalPlugins = [],
}: UsePluginsOptions = {}) => {
  const pluginManager = useMemo(() => {
    const manager = new PluginManager();

    // Register core editor plugins
    manager.register(selectionPlugin);
    manager.register(canvasDragPlugin);
    manager.register(nodeDraggingPlugin);
    manager.register(rotationPlugin);

    // Register tool plugins
    manager.register(selectToolPlugin);
    manager.register(handToolPlugin);

    // Register editing feature plugins
    manager.register(clipboardPlugin);
    manager.register(deletePlugin);
    manager.register(movementPlugin);
    manager.register(zoomPlugin);

    // Register comprehensive node plugins (handle toolbar, shortcuts, drawing, and rendering)
    manager.register(rectangleNodePlugin);
    manager.register(ovalNodePlugin);
    manager.register(pathNodePlugin);

    // Register any additional plugins
    additionalPlugins.forEach((plugin) => {
      manager.register(plugin);
    });

    return manager;
  }, [additionalPlugins]);

  return pluginManager;
};
