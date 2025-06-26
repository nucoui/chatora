import type { VNode } from "@/functionalCustomElement/vNode";
import type { FunctionalCustomElement } from "@root/types/FunctionalCustomElement";
import { setCurrentCustomElementInstance } from "@/functionalCustomElement/get";
import { mount } from "@/functionalCustomElement/mount";
import { setCurrentCustomElementContext } from "@/functionalCustomElement/on";
import { patch } from "@/functionalCustomElement/patch";
import { computed, effect, endBatch, signal, startBatch } from "@/functionalCustomElement/reactivity";
import { applyStyles } from "@/functionalCustomElement/style";
import { genVNode } from "@/functionalCustomElement/vNode";

// Pre-allocated empty objects to reduce memory allocations
const EMPTY_OBJECT = Object.freeze({});

/**
 * Allow generics to be specified at function usage.
 */
const functionalCustomElement: FunctionalCustomElement = (
  callback,
) => {
  if (typeof window === "undefined") {
    throw new TypeError("functionalCustomElement is not supported in SSR environment.");
  }

  return class extends HTMLElement {
    static formAssociated: boolean = false;

    /**
     * MutationObserver instance for attribute changes
     */
    _attributeObserver: MutationObserver;

    /**
     * List of observed attributes
     */
    observedAttributes: readonly string[] = [];

    /**
     * Reactive props holding attribute values
     */
    props = signal<Record<string, string | undefined>>(EMPTY_OBJECT as Record<string, string | undefined>);

    _vnode: VNode | null = null;

    /**
     * Stores the latest render callback for attribute-triggered re-rendering.
     */
    _renderCallback?: () => void;

    /**
     * Prevent multiple effect registrations
     */
    _effectInitialized = false;

    #shadowRoot?: boolean = true;
    #shadowRootMode?: ShadowRootMode = "open";
    #style?: string | string[] = [];

    constructor() {
      super();

      // Set the current context for external lifecycle hooks
      setCurrentCustomElementContext(this.constructor);
      setCurrentCustomElementInstance(this);

      const render = callback({
        /**
         * Optimized defineProps with minimal object creation
         */
        defineProps: (props: Record<string, (value: string | undefined) => any>) => {
          this.observedAttributes = Object.keys(props);

          // Initialize props efficiently
          if (this.observedAttributes.length > 0) {
            const initialProps: Record<string, string | undefined> = {};
            for (let i = 0; i < this.observedAttributes.length; i++) {
              const name = this.observedAttributes[i];
              initialProps[name] = this.getAttribute(name) || undefined;
            }
            this.props[1](initialProps);
          }

          // Return optimized getter function
          return () => {
            const rawProps = this.props[0]();
            const transformedProps: Record<string, any> = {};
            for (const [key, transformer] of Object.entries(props)) {
              transformedProps[key] = transformer(rawProps[key]);
            }
            return transformedProps as any;
          };
        },
        /**
         * Optimized defineEmits with event handler caching
         */
        defineEmits: (events: Record<`on-${string}`, (detail: any) => void>) => {
          const emit = (type: any, detail?: any, options?: { bubbles?: boolean; composed?: boolean; cancelable?: boolean }) => {
            if (type in events) {
              this.dispatchEvent(
                new CustomEvent(type, {
                  detail,
                  bubbles: true,
                  composed: true,
                  cancelable: true,
                  ...options,
                }),
              );
            }
          };

          // Pre-create helper functions for better performance
          const eventNames = Object.keys(events);
          for (let i = 0; i < eventNames.length; i++) {
            const eventName = eventNames[i];
            const methodName = eventName.replace(/^on-/, "");
            (emit as any)[methodName] = (detail: any, options?: any) => {
              emit(eventName, detail, options);
            };
          }

          return emit as any;
        },
      });

      // Context will remain available for the lifetime of this instance

      const renderCallback = () => {
        // Instance context is already set in constructor, no need to set/clear here
        const node = render();

        if (!node && node !== 0)
          return;

        const newVNode = genVNode(node);
        const shadowRootInstance = this.shadowRoot;

        if (!shadowRootInstance) {
          this.#shadowRoot = newVNode.props.shadowRoot ?? true;
          this.#shadowRootMode = newVNode.props.shadowRootMode ?? "open";
          this.#style = newVNode.props.style;
          return;
        }

        if (this._vnode == null) {
          // Initial render - optimized cleanup and mounting
          const children = shadowRootInstance.children;
          for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            if (child.tagName !== "STYLE") {
              shadowRootInstance.removeChild(child);
            }
          }

          this._mountNewVNode(newVNode, shadowRootInstance);
        }
        else {
          // Update render - optimized patching
          this._patchVNode(this._vnode, newVNode, shadowRootInstance);
        }

        this._vnode = newVNode;
      };

      this._renderCallback = renderCallback;

      // Optimized MutationObserver setup
      this._attributeObserver = new MutationObserver((mutationRecords) => {
        if (mutationRecords.length === 0)
          return;

        startBatch();

        const changedAttributes = new Map<string, { oldValue: string | null; newValue: string | null }>();

        // Collect all changes efficiently
        for (let i = 0; i < mutationRecords.length; i++) {
          const record = mutationRecords[i];
          if (record.type === "attributes" && record.attributeName && this.observedAttributes.includes(record.attributeName)) {
            const name = record.attributeName;
            changedAttributes.set(name, {
              oldValue: record.oldValue,
              newValue: this.getAttribute(name),
            });
          }
        }

        // Update props atomically if there are changes
        if (changedAttributes.size > 0) {
          this.props[1]((prev) => {
            const newProps = { ...prev };
            for (const [name, { newValue }] of changedAttributes) {
              newProps[name] = newValue === null ? undefined : newValue;
            }
            return newProps;
          });

          // Call handlers for each change
          for (const [name, { oldValue, newValue }] of changedAttributes) {
            this.handleAttributeChanged(name, oldValue, newValue);
          }
        }

        endBatch();
      });
    }

    /**
     * Optimized initial mounting of VNode
     */
    private _mountNewVNode(newVNode: VNode, shadowRootInstance: ShadowRoot) {
      if (newVNode.tag === "#fragment") {
        // Mount fragment children individually
        const len = newVNode.children.length;
        for (let i = 0; i < len; i++) {
          const child = newVNode.children[i];
          const childNode = typeof child === "string"
            ? document.createTextNode(child)
            : mount(child, shadowRootInstance);
          shadowRootInstance.appendChild(childNode);
        }
      }
      else if (newVNode.tag === "#root") {
        this.#shadowRoot = newVNode.props.shadowRoot ?? true;
        this.#shadowRootMode = newVNode.props.shadowRootMode ?? "open";
        this.#style = newVNode.props.style;

        const len = newVNode.children.length;
        for (let i = 0; i < len; i++) {
          const child = newVNode.children[i];
          const childNode = typeof child === "string"
            ? document.createTextNode(child)
            : mount(child, shadowRootInstance);
          shadowRootInstance.appendChild(childNode);
        }
      }
      else {
        shadowRootInstance.appendChild(mount(newVNode, shadowRootInstance));
      }
    }

    /**
     * Optimized patching of VNode
     */
    private _patchVNode(oldVNode: VNode, newVNode: VNode, shadowRootInstance: ShadowRoot) {
      if (
        (oldVNode.tag === "#fragment" && newVNode.tag === "#fragment")
        || (oldVNode.tag === "#root" && newVNode.tag === "#root")
      ) {
        // Fragment-level patching with optimized child finding
        this._patchFragmentChildren(oldVNode.children, newVNode.children, shadowRootInstance);
      }
      else {
        // Normal element patching
        const targetNode = this._findFirstNonStyleNode(shadowRootInstance);
        if (targetNode) {
          patch(oldVNode, newVNode, shadowRootInstance, targetNode);
        }
      }
    }

    /**
     * Optimized fragment children patching
     */
    private _patchFragmentChildren(oldChildren: Array<VNode | string>, newChildren: Array<VNode | string>, shadowRootInstance: ShadowRoot) {
      const maxLen = Math.max(oldChildren.length, newChildren.length);

      for (let i = 0; i < maxLen; i++) {
        const oldChild = i < oldChildren.length ? oldChildren[i] : undefined;
        const newChild = i < newChildren.length ? newChildren[i] : undefined;

        if (oldChild && newChild) {
          const targetNode = this._findNonStyleNodeByIndex(shadowRootInstance, i);
          if (targetNode) {
            const oldVNode = typeof oldChild === "string"
              ? { tag: "#text" as const, props: {}, children: [oldChild] }
              : oldChild;
            const newVNodeComputed = typeof newChild === "string"
              ? { tag: "#text" as const, props: {}, children: [newChild] }
              : newChild;
            patch(oldVNode, newVNodeComputed, shadowRootInstance, targetNode);
          }
        }
        else if (!oldChild && newChild) {
          const childNode = typeof newChild === "string"
            ? document.createTextNode(newChild)
            : mount(newChild, shadowRootInstance);
          shadowRootInstance.appendChild(childNode);
        }
        else if (oldChild && !newChild) {
          const targetNode = this._findNonStyleNodeByIndex(shadowRootInstance, i);
          if (targetNode) {
            shadowRootInstance.removeChild(targetNode);
          }
        }
      }
    }

    /**
     * Find first non-style node efficiently
     */
    private _findFirstNonStyleNode(shadowRootInstance: ShadowRoot): Node | null {
      const childNodes = shadowRootInstance.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== "STYLE") {
          return node;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          return node;
        }
      }
      return null;
    }

    /**
     * Find non-style node by index efficiently
     */
    private _findNonStyleNodeByIndex(shadowRootInstance: ShadowRoot, index: number): Node | null {
      const childNodes = shadowRootInstance.childNodes;
      let nodeIndex = 0;
      for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== "STYLE") {
          if (nodeIndex === index)
            return node;
          nodeIndex++;
        }
        else if (node.nodeType === Node.TEXT_NODE) {
          if (nodeIndex === index)
            return node;
          nodeIndex++;
        }
      }
      return null;
    }

    handleConnected() {}
    connectedCallback() {
      // Only set MutationObserver if observedAttributes is not empty
      if (this.observedAttributes.length > 0) {
        this._attributeObserver.observe(this, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: [...this.observedAttributes],
        });
      }

      // Register effect/renderCallback only on first call
      if (!this._effectInitialized && this._renderCallback) {
        this._renderCallback();

        // Create shadowRoot and apply styles in a single process
        if (this.#shadowRoot) {
          const shadowRootInstance = this.attachShadow({ mode: this.#shadowRootMode ?? "open" });
          // Only apply styles if present
          if (this.#style) {
            applyStyles(shadowRootInstance, this.#style);
          }
        }

        // Effect to link props changes and rendering
        effect(() => {
          this.props[0](); // Watch props value
          this._renderCallback!();
        });

        this._effectInitialized = true;
      }

      this.handleConnected();
    }

    handleDisconnected() {}
    disconnectedCallback() {
      // Stop observing with MutationObserver
      this._attributeObserver.disconnect();
      this.handleDisconnected();
    }

    handleAttributeChanged(_name: string, _oldValue: string | null, _newValue: string | null) {}
  };
};

export { functionalCustomElement };
export { getHost, getInternals, getShadowRoot } from "@/functionalCustomElement/get";
export { onAdopted, onAttributeChanged, onConnected, onDisconnected } from "@/functionalCustomElement/on";
export { computed, effect, endBatch, signal, startBatch };
