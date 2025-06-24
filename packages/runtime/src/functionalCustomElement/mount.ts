import type { RefValue } from "@root/types/RefValue";
import type { VNode } from "./vNode";
import { MATH_TAGS } from "@/functionalCustomElement/constants/MATH_TAGS";
import { SVG_TAGS } from "@/functionalCustomElement/constants/SVG_TAGS";

/**
 * Generates a DOM node from a vNode. Boolean props are set as empty string for true, removed for false.
 * @param vnode vNode object
 * @param parent Parent DOM node (optional for compatibility)
 * @returns DOM node
 */
export function mount(vnode: VNode, parent?: HTMLElement | ShadowRoot | Element | DocumentFragment): Node {
  const { tag, props, children } = vnode;

  if (typeof tag === "string" && tag !== "#text" && tag !== "#empty" && tag !== "#fragment") {
    const el = (() => {
      const isSvgGroupElement = (() => {
        if (parent instanceof Element) {
          return SVG_TAGS.has(parent.tagName.toLowerCase());
        }

        return false;
      })();

      const isMathGroupElement = (() => {
        if (parent instanceof Element) {
          return MATH_TAGS.has(parent.tagName.toLowerCase());
        }

        return false;
      })();

      if ((SVG_TAGS.has(tag) && isSvgGroupElement) || tag === "svg") {
        return document.createElementNS("http://www.w3.org/2000/svg", tag);
      }

      if ((MATH_TAGS.has(tag) && isMathGroupElement) || tag === "math") {
        return document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
      }

      return document.createElement(tag);
    })();

    // Property setting
    if (props) {
      for (const k in props) {
        const v = props[k];

        if (v == null || v === undefined)
          continue;

        // Event handler
        if (k.startsWith("on") && typeof v === "function") {
          const event = k.slice(2).toLowerCase();
          el.addEventListener(event, v as EventListenerOrEventListenerObject);
        }
        else if (typeof v === "boolean") {
          v ? el.setAttribute(k, "") : el.removeAttribute(k);
        }
        else if (k === "ref") {
          // Do not set ref attribute
        }
        else {
          el.setAttribute(k, String(v));
        }
      }
    }

    // Handling of ref attribute
    if (props && props.ref) {
      const ref = props.ref as RefValue;
      if (typeof ref === "function") {
        ref(el);
      }
      else if (ref && typeof ref === "object") {
        (ref as { current: any }).current = el;
      }
    }

    // Append child elements
    for (const child of children) {
      const node = typeof child === "string"
        ? document.createTextNode(child)
        : mount(child, el);
      el.appendChild(node);
    }
    return el;
  }

  // Processing of special tags
  if (tag === "#empty") {
    return document.createComment("");
  }

  if (tag === "#text") {
    return document.createTextNode(children.join(""));
  }

  // If the tag is unknown, create as div
  const el = document.createElement("div");
  el.setAttribute("data-unknown-tag", tag);
  return el;
}
