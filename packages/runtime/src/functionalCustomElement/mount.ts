import type { RefValue } from "@root/types/RefValue";
import type { VNode } from "./vNode";
import { MATH_TAGS } from "@/functionalCustomElement/constants/MATH_TAGS";
import { SVG_TAGS } from "@/functionalCustomElement/constants/SVG_TAGS";
import { normalizeStyleForDOM } from "./styleObject";

// Cache for namespace checks to avoid repeated lookups
const namespaceCache = new WeakMap<Element, { isSvg: boolean; isMath: boolean }>();

/**
 * Optimized namespace detection with caching
 */
function getNamespaceInfo(parent?: HTMLElement | ShadowRoot | Element | DocumentFragment): { isSvg: boolean; isMath: boolean } {
  if (!parent || !(parent instanceof Element)) {
    return { isSvg: false, isMath: false };
  }

  // Check cache first
  let info = namespaceCache.get(parent);
  if (!info) {
    const tagName = parent.tagName.toLowerCase();
    info = {
      isSvg: SVG_TAGS.has(tagName),
      isMath: MATH_TAGS.has(tagName),
    };
    namespaceCache.set(parent, info);
  }

  return info;
}

/**
 * Optimized element creation with namespace support
 */
function createElement(tag: string, nsInfo: { isSvg: boolean; isMath: boolean }): Element {
  if (tag === "svg" || (SVG_TAGS.has(tag) && nsInfo.isSvg)) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  if (tag === "math" || (MATH_TAGS.has(tag) && nsInfo.isMath)) {
    return document.createElementNS("http://www.w3.org/1998/Math/MathML", tag);
  }

  return document.createElement(tag);
}

/**
 * Optimized property setting with type-specific handling
 */
function setProps(el: Element, props: Record<string, any>) {
  for (const k in props) {
    const v = props[k];

    if (v == null)
      continue;

    // Fast path for event handlers
    if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110) { // "on"
      if (typeof v === "function") {
        const event = k.slice(2).toLowerCase();
        el.addEventListener(event, v as EventListenerOrEventListenerObject);
      }
      continue;
    }

    // Skip ref attribute
    if (k === "ref")
      continue;

    // Handle style attribute specially for objects and arrays
    if (k === "style") {
      el.setAttribute(k, normalizeStyleForDOM(v));
      continue;
    }

    // Fast path for boolean attributes
    if (typeof v === "boolean") {
      v ? el.setAttribute(k, "") : el.removeAttribute(k);
      continue;
    }

    // Default: set as string attribute
    el.setAttribute(k, String(v));
  }
}

/**
 * Generates a DOM node from a vNode. Boolean props are set as empty string for true, removed for false.
 * @param vnode vNode object
 * @param parent Parent DOM node (optional for compatibility)
 * @returns DOM node
 */
export function mount(vnode: VNode, parent?: HTMLElement | ShadowRoot | Element | DocumentFragment): Node {
  const { tag, props, children } = vnode;

  // Fast paths for special tags
  if (tag === "#text") {
    return document.createTextNode(children.join(""));
  }

  if (tag === "#empty") {
    return document.createComment("");
  }

  if (typeof tag === "string" && tag !== "#fragment") {
    const nsInfo = getNamespaceInfo(parent);
    const el = createElement(tag, nsInfo);

    // Set properties if present
    if (props && Object.keys(props).length > 0) {
      setProps(el, props);

      // Handle ref after other props
      if (props.ref) {
        const ref = props.ref as RefValue;
        if (typeof ref === "function") {
          ref(el);
        }
        else if (ref && typeof ref === "object") {
          (ref as { current: any }).current = el;
        }
      }
    }

    // Append child elements with optimized loop
    const len = children.length;
    for (let i = 0; i < len; i++) {
      const child = children[i];
      const node = typeof child === "string"
        ? document.createTextNode(child)
        : mount(child, el);
      el.appendChild(node);
    }

    return el;
  }

  // Fallback for unknown tags
  const el = document.createElement("div");
  el.setAttribute("data-unknown-tag", tag);
  return el;
}
