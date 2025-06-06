import { useCallback, useEffect, useState } from "react";

import { nanoid } from "nanoid";

import type { OcifDocument } from "../schema";

interface CopiedNode {
  node: Exclude<OcifDocument["nodes"], undefined>[number];
  resource?: Exclude<OcifDocument["resources"], undefined>[number];
}

interface UseKeyboardShortcutsProps {
  document: OcifDocument;
  setValue: React.Dispatch<React.SetStateAction<OcifDocument>>;
  selectedNodes: Set<string>;
  setSelectedNodes: (nodes: Set<string>) => void;
}

export const useKeyboardShortcuts = ({
  document,
  setValue,
  selectedNodes,
  setSelectedNodes,
}: UseKeyboardShortcutsProps) => {
  const [copiedNodes, setCopiedNodes] = useState<CopiedNode[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
        // Select all nodes
        e.preventDefault(); // Prevent browser's default select all behavior
        const allNodeIds = new Set(
          document.nodes?.map((node) => node.id) || []
        );
        setSelectedNodes(allNodeIds);
      } else if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        // Copy selected nodes and their resources
        const nodesToCopy =
          document.nodes?.filter((node) => selectedNodes.has(node.id)) || [];
        const copiedNodesWithResources = nodesToCopy.map((node) => {
          const resource = node.resource
            ? document.resources?.find((r) => r.id === node.resource)
            : undefined;
          return { node, resource };
        });
        setCopiedNodes(copiedNodesWithResources);
      } else if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        // Paste nodes with offset
        if (copiedNodes.length === 0) return;

        const newSelectedNodes = new Set<string>();
        const newNodes: Exclude<OcifDocument["nodes"], undefined> = [];
        const newResources: Exclude<OcifDocument["resources"], undefined> = [];

        copiedNodes.forEach(({ node, resource }) => {
          // Create new node with offset position
          const newNode = {
            ...node,
            id: nanoid(),
            position: [
              (node.position?.[0] || 0) + 20,
              (node.position?.[1] || 0) + 20,
            ],
          };

          // If node has a resource, create a copy of it
          if (resource) {
            const newResource = {
              ...resource,
              id: nanoid(),
            };
            newResources.push(newResource);
            newNode.resource = newResource.id;
          }

          newNodes.push(newNode);
          newSelectedNodes.add(newNode.id);
        });

        setValue((prevValue) => ({
          ...prevValue,
          nodes: [...(prevValue.nodes || []), ...newNodes],
          resources: [...(prevValue.resources || []), ...newResources],
        }));

        // Update selection after state update
        setSelectedNodes(newSelectedNodes);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Delete selected nodes and their resources
        if (selectedNodes.size === 0) return;

        // Get all resources that are referenced by selected nodes
        const resourcesToDelete = new Set(
          document.nodes
            ?.filter((node) => selectedNodes.has(node.id))
            .map((node) => node.resource)
            .filter((id): id is string => id !== undefined)
        );

        setValue((prevValue) => ({
          ...prevValue,
          nodes:
            prevValue.nodes?.filter((node) => !selectedNodes.has(node.id)) ||
            [],
          resources:
            prevValue.resources?.filter(
              (resource) => !resourcesToDelete.has(resource.id)
            ) || [],
        }));

        // Clear selection after deletion
        setSelectedNodes(new Set());
      } else if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        // Move selected nodes with arrow keys
        if (selectedNodes.size === 0) return;

        e.preventDefault(); // Prevent page scrolling

        const moveAmount = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        switch (e.key) {
          case "ArrowUp":
            dy = -moveAmount;
            break;
          case "ArrowDown":
            dy = moveAmount;
            break;
          case "ArrowLeft":
            dx = -moveAmount;
            break;
          case "ArrowRight":
            dx = moveAmount;
            break;
        }

        setValue((prevValue) => ({
          ...prevValue,
          nodes:
            prevValue.nodes?.map((node) => {
              if (selectedNodes.has(node.id)) {
                const [x, y] = node.position || [0, 0];
                return {
                  ...node,
                  position: [x + dx, y + dy],
                };
              }
              return node;
            }) || [],
        }));
      }
    },
    [document, selectedNodes, copiedNodes, setValue, setSelectedNodes]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    copiedNodes,
    setCopiedNodes,
  };
};
