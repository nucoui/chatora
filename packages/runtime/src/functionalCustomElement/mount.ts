import type { VNode } from "./vNode";
import { MATH_TAGS } from "@/functionalCustomElement/constants/MATH_TAGS";
import { SVG_TAGS } from "@/functionalCustomElement/constants/SVG_TAGS";

// 空オブジェクトの参照
const EMPTY_PROPS: Record<string, any> = {};

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

    // プロパティ設定の最適化
    if (props && props !== EMPTY_PROPS) {
      for (const k in props) {
        const v = props[k];

        if (v == null || v === undefined)
          continue;

        // イベントハンドラの高速チェック
        if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && typeof v === "function") { // "on"
          const event = k.slice(2).toLowerCase();
          el.addEventListener(event, v as EventListenerOrEventListenerObject);
        }
        else if (typeof v === "boolean") {
          v ? el.setAttribute(k, "") : el.removeAttribute(k);
        }
        else {
          el.setAttribute(k, String(v));
        }
      }
    }

    // 子要素の追加最適化
    if (children.length > 0) {
      if (children.length === 1) {
        // 子要素が1つの場合の高速パス
        const child = children[0];
        const node = typeof child === "string"
          ? document.createTextNode(child)
          : mount(child, el);
        el.appendChild(node);
      }
      else {
        // 複数の子要素の場合はDocumentFragmentを使用
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const node = typeof child === "string"
            ? document.createTextNode(child)
            : mount(child, el);
          fragment.appendChild(node);
        }
        el.appendChild(fragment);
      }
    }
    return el;
  }

  // 特殊なタグの処理
  if (tag === "#empty") {
    return document.createComment("");
  }

  if (tag === "#text") {
    return document.createTextNode(children.join(""));
  }

  // 未知のタグの場合はdivとして作成
  const el = document.createElement("div");
  el.setAttribute("data-unknown-tag", tag);
  return el;
}
