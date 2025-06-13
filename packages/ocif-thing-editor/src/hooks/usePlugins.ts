import { useMemo } from "react";

import { PluginManager } from "../plugins/PluginManager";
import { canvasDragPlugin } from "../plugins/canvasDragPlugin";
import { clipboardPlugin } from "../plugins/clipboardPlugin";
import { deletePlugin } from "../plugins/deletePlugin";
import { drawToolPlugin } from "../plugins/drawToolPlugin";
import { handToolPlugin } from "../plugins/handToolPlugin";
import { movementPlugin } from "../plugins/movementPlugin";
import { nodeDraggingPlugin } from "../plugins/nodeDraggingPlugin";
import { ovalToolPlugin } from "../plugins/ovalToolPlugin";
import { pathDrawingPlugin } from "../plugins/pathDrawingPlugin";
import { rectangleToolPlugin } from "../plugins/rectangleToolPlugin";
import { rotationPlugin } from "../plugins/rotationPlugin";
import { selectToolPlugin } from "../plugins/selectToolPlugin";
import { selectionPlugin } from "../plugins/selectionPlugin";
import { shapeDrawingPlugin } from "../plugins/shapeDrawingPlugin";
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

    // Register core plugins
    manager.register(selectionPlugin);
    manager.register(canvasDragPlugin);
    manager.register(shapeDrawingPlugin);
    manager.register(nodeDraggingPlugin);
    manager.register(rotationPlugin);
    manager.register(pathDrawingPlugin);

    // Register tool plugins (contain both toolbar items and keyboard shortcuts)
    manager.register(selectToolPlugin);
    manager.register(handToolPlugin);
    manager.register(rectangleToolPlugin);
    manager.register(ovalToolPlugin);
    manager.register(drawToolPlugin);

    // Register editing feature plugins
    manager.register(clipboardPlugin);
    manager.register(deletePlugin);
    manager.register(movementPlugin);
    manager.register(zoomPlugin);

    // Register any additional plugins
    additionalPlugins.forEach((plugin) => {
      manager.register(plugin);
    });

    return manager;
  }, [additionalPlugins]);

  return pluginManager;
};
