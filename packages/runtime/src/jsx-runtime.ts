import type { IC } from "@/main";
import type { ChatoraJSXElement, ChatoraNode } from "../types/JSX.namespace";

// Pre-allocated objects to reduce memory allocation
const FRAGMENT_TAG = "#fragment";
const ROOT_TAG = "#root";

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

type HostProps = {
  children: ChatoraNode;
  shadowRoot?: boolean;
  style?: string | string[];
} & ({
  shadowRoot?: true;
  shadowRootMode?: "open" | "closed";
} | {
  shadowRoot?: false;
  shadowRootMode?: never;
});

export const Host: IC<HostProps> = ({ children, ...rest }) => {
  return () => ({
    tag: ROOT_TAG,
    props: {
      children: Array.isArray(children) ? children : [children],
      ...rest,
    },
  });
};

/**
 * JSX runtime function for client: returns ChatoraJSXElement (VNode)
 * Optimized with minimal object creation
 * @param tag HTML tag name or function component
 * @param props props + children
 * @returns ChatoraJSXElement
 */
export function jsx(
  tag: string | IC,
  props: Record<string, any> | null,
): ChatoraJSXElement {
  return { tag, props: props || {} };
}

export { jsx as jsxs };
