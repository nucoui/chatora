import type { IC, CC } from "@/main";
import type { ChatoraJSXElement, ChatoraNode } from "../types/JSX.namespace";
import { FRAGMENT_TAG } from "@/constants/TAG";

export { Host } from "@/components/Host";

/**
 * Function component implementation for JSX.Fragment
 * Returns #fragment tag, children are flattened by normalizeChildren
 */
export const Fragment: IC<{ children: ChatoraNode }> = ({ children }) => {
  return () => ({
    tag: FRAGMENT_TAG,
    props: {
      children: Array.isArray(children) ? children : [children],
    },
  });
};

/**
 * JSX runtime function for client: returns ChatoraJSXElement (VNode)
 * Optimized with minimal object creation
 * @param tag HTML tag name, IC function component, or CC component
 * @param props props + children
 * @returns ChatoraJSXElement
 */
export function jsx(
  tag: string | IC | CC,
  props: Record<string, any> | null,
): ChatoraJSXElement {
  return { tag, props: props || {} };
}

export { jsx as jsxs };
export type * from "@root/types/JSX.namespace";
