import type { ChatoraNode } from "@root/types/JSX.namespace";
import type { RefValue } from "@root/types/RefValue";

export type VNode = {
  tag: "#text" | "#empty" | "#fragment" | "#unknown" | string;
  props: Record<string | `on${string}` | "ref", any> & { ref?: RefValue };
  children: Array<VNode | string>;
};

// Pre-allocated empty arrays to reduce allocations
const EMPTY_CHILDREN: Array<VNode | string> = [];

function normalizeChildren(input: ChatoraNode): Array<VNode | string> {
  if (input == null)
    return EMPTY_CHILDREN;

  if (Array.isArray(input)) {
    const len = input.length;
    if (len === 0)
      return EMPTY_CHILDREN;

    const result: Array<VNode | string> = [];
    for (let i = 0; i < len; i++) {
      const item = input[i];
      if (item == null)
        continue;

      if (typeof item === "string" || typeof item === "number") {
        result.push(String(item));
      }
      else if (Array.isArray(item)) {
        result.push(...normalizeChildren(item));
      }
      else if (typeof item === "object") {
        const vnode = genVNode(item);
        if (vnode.tag === "#fragment" || vnode.tag === "#root") {
          result.push(...vnode.children);
        }
        else {
          result.push(vnode);
        }
      }
    }
    return result;
  }

  if (typeof input === "string")
    return [input];
  if (typeof input === "number")
    return [String(input)];

  if (typeof input === "object" && input !== null) {
    const vnode = genVNode(input);
    if (vnode.tag === "#fragment" || vnode.tag === "#root") {
      return vnode.children;
    }
    return [vnode];
  }

  return EMPTY_CHILDREN;
}

export function genVNode(node: ChatoraNode): VNode {
  // Nullish values
  if (node == null || node === false || node === true) {
    return { tag: "#empty", props: {}, children: EMPTY_CHILDREN };
  }

  // Primitive values - optimized string conversion
  if (typeof node === "string") {
    return { tag: "#text", props: {}, children: [node] };
  }
  if (typeof node === "number") {
    return { tag: "#text", props: {}, children: [String(node)] };
  }

  // Object node
  if ("tag" in node && "props" in node) {
    const { tag, props = {} } = node;
    const { children, ...restProps } = props;

    // Handle function component with early return optimization
    if (typeof tag === "function") {
      const result = tag(props as any);
      if (typeof result === "function") {
        const next = result();
        if (next && typeof next === "object" && "tag" in next && "props" in next) {
          return genVNode(next);
        }
      }
      return { tag: "#empty", props: {}, children: EMPTY_CHILDREN };
    }

    // Handle string tag with optimized children processing
    if (typeof tag === "string") {
      const normalizedChildren = children ? normalizeChildren(children as Array<VNode | string>) : EMPTY_CHILDREN;

      return {
        tag,
        props: Object.keys(restProps).length === 0 ? {} : restProps,
        children: normalizedChildren,
      };
    }

    // Unknown tag fallback
    return {
      tag: "#unknown",
      props: Object.keys(restProps).length === 0 ? {} : restProps,
      children: children ? normalizeChildren(children as Array<VNode | string>) : EMPTY_CHILDREN,
    };
  }

  throw new Error(`Invalid node type: ${typeof node}`);
};
