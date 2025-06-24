import type { AsFunctionType, CC } from "@root/types/FunctionalCustomElement";
import type { ChatoraNode } from "@root/types/JSX.namespace";
import type { Element, ElementContent, Root } from "hast";
import { genVNode } from "../functionalCustomElement/vNode";

/**
 * Creates Declarative Shadow DOM HTML elements using JSX/TSX for server-side rendering.
 * Takes the same arguments as functionalCustomElement but returns a hast object instead of manipulating the DOM.
 *
 * @param callback - Callback to register lifecycle hooks and rendering functions
 * @param options - Options for ShadowRoot and Form association
 * @param options.props - Initial property values
 * @returns hast object (HTML Abstract Syntax Tree)
 */
const functionalDeclarativeCustomElement = <
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

  // Lightweight reactivity for SSR
  const ssrSignal = <T>(value: T): [() => T, (newValue: T | ((prev: T) => T)) => void] => {
    const getter = () => value;
    const setter = () => {}; // No update needed for SSR
    return [getter, setter];
  };

  const ssrComputed = <T>(fn: () => T) => () => fn();
  const ssrEffect = () => () => {}; // No side effects for SSR
  const noop = () => {};

  const render = callback({
    reactivity: {
      signal: ssrSignal,
      effect: ssrEffect,
      computed: ssrComputed,
      startBatch: noop,
      endBatch: noop,
    },
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
    // Lifecycle hooks are not needed for SSR
    onConnected: noop,
    onDisconnected: noop,
    onAttributeChanged: noop,
    onAdopted: noop,
    /**
     * Returns the host element (this custom element itself)
     * For SSR, returns an empty object
     */
    getHost: () => ({} as HTMLElement),
    /**
     * Returns the ShadowRoot
     * For SSR, returns null
     */
    getShadowRoot: () => null,
    /**
     * Returns ElementInternals (always undefined for SSR)
     */
    getInternals: () => undefined,
  });

  jsxResult = render();

  // Convert to VNode
  const vnode = genVNode(jsxResult);
  // Convert VNode to hast
  const contentElement = vNodeToHast(vnode);

  let styles: string | string[] = [];
  let shadowRoot: boolean = true;
  let shadowRootMode: "open" | "closed" = "open";

  if (vnode.tag === "#root") {
    shadowRoot = vnode.props.shadowRoot ?? shadowRoot;
    shadowRootMode = vnode.props.shadowRootMode ?? shadowRootMode;
    styles = vnode.props.style ?? styles;
  }

  // Pre-generate style elements if present
  const styleElements: Element[] = styles
    ? (Array.isArray(styles) ? styles : [styles]).map(cssText => ({
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
 * Converts to match the VNode structure of functionalCustomElement
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

export { functionalDeclarativeCustomElement };
