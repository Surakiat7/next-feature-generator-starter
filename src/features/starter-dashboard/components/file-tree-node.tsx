import type { TreeNodeState } from "../types/generator-demo.types";

export interface TreeNode {
  name: string;
  isFile: boolean;
  state: TreeNodeState;
  children: TreeNode[];
}

const STATE_CLASS: Record<TreeNodeState, string> = {
  existing: "text-zinc-500 dark:text-zinc-500",
  added: "text-emerald-600 dark:text-emerald-400",
  highlight: "text-amber-600 dark:text-amber-400",
};

function Marker({ state }: { state: TreeNodeState }) {
  if (state === "added") return <span className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-400">＋ new</span>;
  if (state === "highlight") return <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400">● modified</span>;
  return null;
}

export function FileTreeNode({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <li>
      <div
        className={`flex items-center whitespace-nowrap ${STATE_CLASS[node.state]}`}
        style={{ paddingLeft: `${depth * 14}px` }}
      >
        <span aria-hidden className="mr-1.5 opacity-60">
          {node.isFile ? "─" : "▸"}
        </span>
        <span className={node.isFile ? "" : "font-medium text-zinc-700 dark:text-zinc-300"}>
          {node.name}
          {node.isFile ? "" : "/"}
        </span>
        <Marker state={node.state} />
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <FileTreeNode key={child.name} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
