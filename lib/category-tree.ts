import type { Category, CategoryNode } from "./categories-types";

// Max category levels (cha → con → con của con). 0-indexed max depth.
export const MAX_DEPTH = 2;

export function depthOf(flat: Category[], id: string): number {
  const byId = new Map(flat.map((c) => [c.id, c]));
  let d = 0;
  let cur = byId.get(id);
  while (cur?.parentId && byId.has(cur.parentId)) {
    cur = byId.get(cur.parentId);
    d++;
    if (d > 100) break;
  }
  return d;
}

export function subtreeHeight(flat: Category[], rootId: string): number {
  const byParent = new Map<string, Category[]>();
  for (const c of flat) {
    if (c.parentId) {
      const arr = byParent.get(c.parentId);
      if (arr) arr.push(c);
      else byParent.set(c.parentId, [c]);
    }
  }
  const dfs = (id: string): number => {
    const ch = byParent.get(id);
    if (!ch || ch.length === 0) return 0;
    let h = 0;
    for (const c of ch) h = Math.max(h, dfs(c.id) + 1);
    return h;
  };
  return dfs(rootId);
}

export function sortByTree(flat: Category[]): { category: Category; depth: number }[] {
  const byParent = new Map<string | null, Category[]>();
  for (const c of flat) {
    const arr = byParent.get(c.parentId);
    if (arr) arr.push(c);
    else byParent.set(c.parentId, [c]);
  }
  const out: { category: Category; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const c of byParent.get(parentId) ?? []) {
      out.push({ category: c, depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export function buildTree(flat: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  for (const c of flat) nodes.set(c.id, { ...c, children: [] });
  const roots: CategoryNode[] = [];
  for (const c of flat) {
    const node = nodes.get(c.id)!;
    if (c.parentId && nodes.has(c.parentId)) {
      nodes.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function collectDescendantIds(flat: Category[], rootId: string): Set<string> {
  const byParent = new Map<string, Category[]>();
  for (const c of flat) {
    if (c.parentId) {
      const arr = byParent.get(c.parentId);
      if (arr) arr.push(c);
      else byParent.set(c.parentId, [c]);
    }
  }
  const out = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    for (const child of byParent.get(id) ?? []) {
      if (!out.has(child.id)) {
        out.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return out;
}
