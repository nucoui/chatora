import type { ChatoraNode } from "@root/types/JSX.namespace";
import type { RefValue } from "@root/types/RefValue";
import type { CC } from "@root/types/GenSD";
import { withCustomElementContext } from "@/methods/core/get";
import { signal } from "@chatora/reactivity";

type VNode = {
  tag: "#text" | "#empty" | "#fragment" | "#unknown" | string;
  props: Record<string | `on${string}` | "ref", any> & { ref?: RefValue };
  children: Array<VNode | string>;
};

// Pre-allocated empty arrays to reduce allocations
const EMPTY_CHILDREN: Array<VNode | string> = [];

/**
 * Virtual custom element for CC components used in JSX context
 * This provides the necessary context for signals and lifecycle hooks to work
 */
class VirtualCustomElement {
  private _props = signal<Record<string, string | undefined>>({});
  private _attrs: Record<string, string | undefined> = {};
  
  constructor(initialProps: Record<string, any> = {}) {
    // Convert props to string attributes (simulating custom element behavior)
    const attrs: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(initialProps)) {
      if (value != null && typeof value !== 'function') {
        attrs[key] = String(value);
      }
    }
    this._attrs = attrs;
    this._props.set(attrs);
  }

  /**
   * Get current attributes as a signal
   */
  get props() {
    return this._props;
  }

  /**
   * Simulate getAttribute method
   */
  getAttribute(name: string): string | null {
    return this._attrs[name] ?? null;
  }

  /**
   * Simulate setAttribute method
   */
  setAttribute(name: string, value: string): void {
    this._attrs[name] = value;
    this._props.set({ ...this._attrs });
  }

  /**
   * Simulate removeAttribute method
   */
  removeAttribute(name: string): void {
    delete this._attrs[name];
    this._props.set({ ...this._attrs });
  }
}

/**
 * Execute a CC component within a virtual custom element context
 */
function executeCC(cc: CC<any, any>, props: Record<string, any>) {
  try {
    const virtualElement = new VirtualCustomElement(props);
    
    // Cast for type compatibility with existing context system
    const virtualHTMLElement = virtualElement as any as HTMLElement;
    
    return withCustomElementContext(virtualHTMLElement, () => {
      // Create defineProps function
      const defineProps = (propDefs: Record<string, (value: string | undefined) => any>) => {
        return () => {
          const result: Record<string, any> = {};
          for (const [key, transformer] of Object.entries(propDefs)) {
            const attrValue = virtualElement.getAttribute(key);
            result[key] = transformer(attrValue);
          }
          return result;
        };
      };

      // Create defineEmits function (no-op for JSX rendering context)
      const defineEmits = (events: Record<string, (detail: any) => void>) => {
        return (type: string, detail?: any, options?: EventInit) => {
          // In JSX context, we don't emit actual events
          // This is just for compatibility
          console.debug(`CC component in JSX context attempted to emit "${type}"`, detail);
        };
      };

      try {
        // Execute the CC component - the error might happen here too
        const renderFn = cc({ defineProps, defineEmits });
        try {
          return renderFn();
        } catch (renderError) {
          console.error("Error executing CC render function:", renderError);
          throw renderError;
        }
      } catch (error) {
        console.error("Error executing CC component:", error);
        throw error; // Re-throw so it can be caught by the caller
      }
    });
  } catch (error) {
    console.error("Error in CC execution context:", error);
    throw error; // Re-throw so it can be caught by the caller
  }
}

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

function genVNode(node: ChatoraNode): VNode {
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
      // All function components are now treated as CC components
      try {
        const ccResult = executeCC(tag as CC<any, any>, props as any);
        
        if (Array.isArray(ccResult)) {
          // Return fragment for array results
          return {
            tag: "#fragment",
            props: {},
            children: normalizeChildren(ccResult),
          };
        } else if (ccResult && typeof ccResult === "object" && "tag" in ccResult && "props" in ccResult) {
          return genVNode(ccResult);
        } else if (ccResult) {
          return genVNode(ccResult);
        } else {
          return { tag: "#empty", props: {}, children: EMPTY_CHILDREN };
        }
      } catch (error) {
        console.error("Error executing CC component:", error);
        return { tag: "#empty", props: {}, children: EMPTY_CHILDREN };
      }
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

export type {
  VNode,
};

export {
  genVNode,
};
