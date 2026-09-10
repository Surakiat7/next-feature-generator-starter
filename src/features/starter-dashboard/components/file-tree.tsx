import type { TreeEntry, TreeNodeState } from "../types/generator-demo.types";
import { FileTreeNode, type TreeNode } from "./file-tree-node";

/** Build a nested tree from flat, slash-separated entries. */
function buildTree(entries: TreeEntry[]): TreeNode[] {
  const roots: TreeNode[] = [];
  const index = new Map<string, TreeNode>();

  for (const entry of entries) {
    const isFile = !entry.path.endsWith("/");
    const segments = entry.path.split("/").filter(Boolean);

    let parentKey = "";
    let siblings = roots;
    segments.forEach((name, i) => {
      const isLeaf = i === segments.length - 1;
      const key = parentKey ? `${parentKey}/${name}` : name;
      let node = index.get(key);
      if (!node) {
        node = {
          name,
          isFile: isLeaf ? isFile : false,
          state: isLeaf ? entry.state : "existing",
          children: [],
        };
        index.set(key, node);
        siblings.push(node);
      } else if (isLeaf) {
        // Promote state when an existing intermediate node is itself an entry.
        node.state = mergeState(node.state, entry.state);
        node.isFile = node.children.length === 0 ? isFile : false;
      }
      siblings = node.children;
      parentKey = key;
    });
  }

  return roots;
}

function mergeState(a: TreeNodeState, b: TreeNodeState): TreeNodeState {
  if (a === "highlight" || b === "highlight") return "highlight";
  if (a === "added" || b === "added") return "added";
  return "existing";
}

export function FileTree({ entries }: { entries: TreeEntry[] }) {
  const roots = buildTree(entries);
  return (
    <ul className="font-mono text-xs leading-6">
      {roots.map((node) => (
        <FileTreeNode key={node.name} node={node} depth={0} />
      ))}
    </ul>
  );
}
