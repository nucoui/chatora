import type { IC } from "@/main";
import type { ChatoraJSXElement, ChatoraNode } from "../types/JSX.namespace";

/**
 * Function component implementation for JSX.Fragment
 * Returns #fragment tag, children are flattened by normalizeChildren
 */
export const Fragment: IC<{ children: ChatoraNode }> = ({ children }) => {
  return () => ({
    tag: "#fragment",
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
    tag: "#root",
    props: {
      children: Array.isArray(children) ? children : [children],
      ...rest,
    },
  });
};

/**
 * JSX runtime function for client: returns ChatoraJSXElement (VNode)
 * @param tag HTML tag name or function component
 * @param props props + children
 * @returns ChatoraJSXElement
 */
export function jsx(
  tag: string | IC,
  props: Record<string, any>,
): ChatoraJSXElement {
  return { tag, props };
}

export { jsx as jsxs };
