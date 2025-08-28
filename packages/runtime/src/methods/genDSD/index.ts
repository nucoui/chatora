import type { ChatoraNode } from "@/jsx-runtime";
import type { AsFunctionType, CC, StyleInput } from "@/main";
import type { Element, ElementContent, Root } from "hast";
import { normalizeStyleForShadowDOM } from "@/main";
import { genVNode } from "@/methods/core/vNode";

/**
 * Normalize style input to array of CSS strings for SSR (optimized for SSR)
 *
 * @param styles Style input (string, object, or array)
 * @returns Array of CSS strings
 */
function normalizeStylesForSSR(styles: StyleInput): string[] {
  if (!styles)
    return [];

  if (typeof styles === "string") {
    return [styles];
  }

  if (Array.isArray(styles)) {
    return styles.map(item => normalizeStyleForShadowDOM(item));
  }

  // styles is CSSStyleObject
  return [normalizeStyleForShadowDOM(styles)];
}

/**
 * Creates Declarative Shadow DOM HTML elements using JSX/TSX for server-side rendering.
 * Takes the same arguments as createCC but returns a hast object instead of manipulating the DOM.
 *
 * @param callback - Callback to register lifecycle hooks and rendering functions
 * @param options - Options for ShadowRoot and Form association
 * @param options.props - Initial property values
 * @returns hast object (HTML Abstract Syntax Tree)
 */
const genDSD = <
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<`on-${string}`, never>,
>(
  callback: CC<P, E>,
  options?: { props?: P },
): Root => {
  const {
    props: initialProps,
  } = options || {};

  // Initialize props (no signal needed for SSR)
  const _propsData = initialProps || {};
  let jsxResult: ChatoraNode | null = null;

  const render = callback({
    /**
     * Accepts an object of attribute transformer functions and returns a getter function for attribute values.
     * For SSR, only returns initial values.
     *
     * @param propsTransformers - Object of attribute transformer functions
     * @returns Getter function for attribute values
     */
    defineProps: <T extends AsFunctionType<P>>(propsTransformers: T) => {
      // Precompute property values (not changed in SSR)
      const computedProps: Record<string, any> = {};

      // Generate default values with transformers
      for (const key of Object.keys(propsTransformers)) {
        computedProps[key] = propsTransformers[key as keyof T](undefined);
      }

      // Overwrite with initial props
      for (const key of Object.keys(_propsData)) {
        if (key in propsTransformers) {
          computedProps[key] = propsTransformers[key as keyof T](
            (_propsData as Record<string, any>)[key],
          );
        }
      }

      return () => computedProps as any;
    },
    /**
     * Accepts an object with event handlers and returns a function to emit events.
     * For SSR, returns a dummy function.
     *
     * @param _events - Object with event handlers (not used in SSR)
     * @returns Dummy function for SSR
     */
    defineEmits: (_events: Record<`on-${string}`, (detail: any) => void>) => {
      // Return dummy function for SSR
      const dummyEmit = () => {};
      return dummyEmit as any;
    },
  });

  jsxResult = render();

  // Convert to VNode
  const vnode = genVNode(jsxResult);
  // Convert VNode to hast
  const contentElement = vNodeToHast(vnode);

  let styles: StyleInput | undefined;
  let shadowRoot: boolean = true;
  let shadowRootMode: "open" | "closed" = "open";

  if (vnode.tag === "#root") {
    shadowRoot = vnode.props.shadowRoot ?? shadowRoot;
    shadowRootMode = vnode.props.shadowRootMode ?? shadowRootMode;
    styles = vnode.props.style;
  }

  // Pre-generate style elements if present
  const styleElements: Element[] = styles
    ? normalizeStylesForSSR(styles).map(cssText => ({
        type: "element",
        tagName: "style",
        properties: {},
        children: [{ type: "text", value: cssText }],
      }))
    : [];

  // Create template element for Declarative Shadow DOM (only if shadowRoot=true)
  if (shadowRoot) {
    const templateChildren = [
      ...styleElements,
      ...(Array.isArray(contentElement) ? contentElement : [contentElement]),
    ].filter(Boolean) as ElementContent[];

    return {
      type: "root",
      children: [{
        type: "element",
        tagName: "template",
        properties: { shadowrootmode: shadowRootMode },
        children: templateChildren,
      }],
    };
  }

  // If shadowRoot=false, return normal HTML elements
  return {
    type: "root",
    children: Array.isArray(contentElement) ? contentElement : [contentElement],
  };
};

/**
 * Converts ChatoraNode (JSX result) to hast element
 * Converts to match the VNode structure of createCC
 */
function vNodeToHast(node: any): ElementContent | ElementContent[] {
  if (!node)
    return { type: "text", value: "" };
  // #text, #empty, #fragment, #unknown, string, number, VNode, array
  if (Array.isArray(node)) {
    return node.flatMap(vNodeToHast);
  }
  if (typeof node === "string" || typeof node === "number") {
    return { type: "text", value: String(node) };
  }
  if (typeof node === "object" && node.tag) {
    if (node.tag === "#text") {
      return { type: "text", value: node.children[0] ?? "" };
    }
    if (node.tag === "#empty") {
      return { type: "text", value: "" };
    }
    if (node.tag === "#fragment" || node.tag === "#root") {
      // Flatten children for fragment
      return node.children.flatMap(vNodeToHast);
    }
    // Normal element
    const props: Record<string, any> = {};
    for (const [k, v] of Object.entries(node.props ?? {})) {
      if (k === "className")
        props.class = v;
      else if (!/^on[A-Z]/.test(k))
        props[k] = v;
    }
    return {
      type: "element",
      tagName: node.tag,
      properties: props,
      children: node.children ? node.children.flatMap(vNodeToHast) : [],
    };
  }
  return { type: "text", value: "" };
}

/**
 * Alias for genDSD to maintain compatibility with existing code that expects functionalDeclarativeCustomElement
 * Creates Declarative Shadow DOM HTML elements using JSX/TSX for server-side rendering.
 * 
 * @param callback - Callback to register lifecycle hooks and rendering functions
 * @param options - Options for ShadowRoot and Form association
 * @returns hast object (HTML Abstract Syntax Tree)
 */
const functionalDeclarativeCustomElement = genDSD;

export { genDSD, functionalDeclarativeCustomElement };
