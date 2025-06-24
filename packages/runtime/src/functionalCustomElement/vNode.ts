import type { ChatoraNode } from "@root/types/JSX.namespace";
import type { RefValue } from "@root/types/RefValue";

export type VNode = {
  tag: "#text" | "#empty" | "#fragment" | "#unknown" | string;
  props: Record<string | `on${string}` | "ref", any> & { ref?: RefValue };
  children: Array<VNode | string>;
};

function normalizeChildren(input: ChatoraNode): Array<VNode | string> {
  if (input == null)
    return [];

  if (Array.isArray(input)) {
    const result: Array<VNode | string> = [];
    for (const item of input) {
      const normalized = normalizeChildren(item);
      result.push(...normalized);
    }
    return result;
  }

  if (typeof input === "string" || typeof input === "number") {
    return [{ tag: "#text", props: {}, children: [String(input)] }];
  }

  if (typeof input === "object" && input !== null) {
    const vnode = genVNode(input);
    // fragmentの場合は子要素を平坦化
    if (vnode.tag === "#fragment" || vnode.tag === "#root") {
      return vnode.children;
    }
    return [vnode];
  }

  return [];
}

export function genVNode(node: ChatoraNode): VNode {
  // nullish値
  if (node == null || node === false || node === true || node === undefined) {
    return { tag: "#empty", props: {}, children: [] };
  }

  // プリミティブ値
  if (typeof node === "string" || typeof node === "number") {
    return { tag: "#text", props: {}, children: [String(node)] };
  }

  // オブジェクトの場合
  if ("tag" in node && "props" in node) {
    const { tag, props } = node;
    const { children, ...restProps } = props ?? {};

    // 関数コンポーネントの処理
    if (typeof tag === "function") {
      const result = tag(props as any);
      if (typeof result === "function") {
        const next = result();
        if (next && typeof next === "object" && "tag" in next && "props" in next) {
          return genVNode(next);
        }
      }
    }

    // 文字列タグの処理
    if (typeof tag === "string") {
      const normalizedChildren = children ? normalizeChildren(children as Array<VNode | string>) : [];

      if (tag === "#fragment") {
        return {
          tag: "#fragment",
          props: restProps ?? {},
          children: normalizedChildren,
        };
      }

      return {
        tag,
        props: restProps ?? {},
        children: normalizedChildren,
      };
    }

    // 未知のタグ
    return {
      tag: "#unknown",
      props: restProps ?? {},
      children: normalizeChildren(children as Array<VNode | string>),
    };
  }

  throw new Error(`Invalid node type: ${typeof node}`);
};
