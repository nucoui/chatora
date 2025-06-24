import type { VNode } from "@/functionalCustomElement/vNode";
import { mount } from "@/functionalCustomElement/mount";

function patchProps(el: HTMLElement, oldProps: Record<string, any>, newProps: Record<string, any>) {
  if (oldProps === newProps)
    return;

  // Remove old props
  for (const k in oldProps) {
    if (!(k in newProps)) {
      if (k[0] === "o" && k[1] === "n") {
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
      }
      else {
        el.removeAttribute(k);
      }
    }
  }

  // Add/update new props
  for (const k in newProps) {
    const newVal = newProps[k];
    if (newVal === oldProps[k])
      continue;

    if (newVal == null) {
      el.removeAttribute(k);
    }
    else if (k[0] === "o" && k[1] === "n") {
      if (oldProps[k])
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
      el.addEventListener(k.slice(2).toLowerCase(), newVal);
    }
    else if (typeof newVal === "boolean") {
      newVal ? el.setAttribute(k, "") : el.removeAttribute(k);
    }
    else {
      el.setAttribute(k, String(newVal));
    }
  }
}

// Optimization for patching child elements
function patchChildren(
  oldChildren: Array<VNode | string>,
  newChildren: Array<VNode | string>,
  parent: Node,
  getChildDom: (idx: number) => Node | null,
  insertRef: Node | null = null,
) {
  const oldLen = oldChildren.length;
  const newLen = newChildren.length;

  // Fast path: both sides empty
  if (oldLen === 0 && newLen === 0)
    return;

  // Fast path: same length and all strings
  if (oldLen === newLen && oldLen > 0) {
    let allStrings = true;
    for (let i = 0; i < oldLen; i++) {
      if (typeof oldChildren[i] !== "string" || typeof newChildren[i] !== "string") {
        allStrings = false;
        break;
      }
    }
    if (allStrings) {
      for (let i = 0; i < oldLen; i++) {
        const childDom = getChildDom(i);
        if (childDom && childDom.nodeType === Node.TEXT_NODE && oldChildren[i] !== newChildren[i]) {
          childDom.textContent = newChildren[i] as string;
        }
      }
      return;
    }
  }

  const maxLen = Math.max(oldLen, newLen);

  // Normal diff patching (process in reverse to avoid index shift on removal)
  for (let i = maxLen - 1; i >= 0; i--) {
    const oldChild = i < oldLen ? oldChildren[i] : undefined;
    const newChild = i < newLen ? newChildren[i] : undefined;
    const childDom = getChildDom(i);

    if (oldChild && newChild) {
      // Patch existing node
      if (childDom) {
        if (typeof oldChild === "string" && typeof newChild === "string") {
          // Both are strings: update textContent
          if (oldChild !== newChild && childDom instanceof Text) {
            childDom.textContent = newChild;
          }
        }
        else if (typeof oldChild === "string" || typeof newChild === "string") {
          // One is string: replace with new node
          const newNode = typeof newChild === "string" ? document.createTextNode(newChild) : mount(newChild);
          if (parent instanceof Element || parent instanceof ShadowRoot) {
            parent.replaceChild(newNode, childDom);
          }
        }
        else {
          // Both are VNode
          patch(oldChild, newChild, parent, childDom);
        }
      }
    }
    else if (!oldChild && newChild) {
      // Add new node
      const newNode = typeof newChild === "string" ? document.createTextNode(newChild) : mount(newChild);
      if (parent instanceof Element || parent instanceof ShadowRoot) {
        if (insertRef) {
          parent.insertBefore(newNode, insertRef);
        }
        else {
          parent.appendChild(newNode);
        }
      }
    }
    else if (oldChild && !newChild) {
      // Remove old node
      if (childDom && (parent instanceof Element || parent instanceof ShadowRoot)) {
        parent.removeChild(childDom);
      }
    }
  }
}

/**
 * Patch the DOM by comparing oldVNode and newVNode, updating only the changed parts.
 * @param oldVNode The previous virtual node
 * @param newVNode The new virtual node
 * @param parent The parent DOM node
 * @param domNode The current DOM node corresponding to oldVNode
 * @returns The updated DOM node
 */
export function patch(
  oldVNode: VNode,
  newVNode: VNode,
  parent: Node,
  domNode: Node,
): Node {
  // Fast path: same VNode object
  if (oldVNode === newVNode)
    return domNode;

  // Early return: domNode does not exist
  if (!domNode) {
    const newDom = mount(newVNode);
    if (parent instanceof Element || parent instanceof ShadowRoot) {
      parent.appendChild(newDom);
    }
    return newDom;
  }

  const oldTag = oldVNode.tag;
  const newTag = newVNode.tag;

  // Early return: tag changed, replace node
  if (oldTag !== newTag) {
    const newDom = mount(newVNode);
    parent.replaceChild(newDom, domNode);
    return newDom;
  }

  // Optimize text node
  if (newTag === "#text") {
    if (domNode.nodeType === Node.TEXT_NODE) {
      const newText = newVNode.children.join("");
      if (domNode.textContent !== newText) {
        domNode.textContent = newText;
      }
      return domNode;
    }
    const newDom = mount(newVNode);
    parent.replaceChild(newDom, domNode);
    return newDom;
  }

  // Empty node
  if (newTag === "#empty") {
    return domNode;
  }

  // Normal HTML element
  if (typeof newTag === "string" && newTag !== "#fragment") {
    const el = domNode as HTMLElement;
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};

    // Diff props
    patchProps(el, oldProps, newProps);

    // Diff children
    patchChildren(
      oldVNode.children || [],
      newVNode.children || [],
      el,
      idx => el.childNodes[idx] || null,
    );
    return el;
  }

  // Other cases, mount new
  const newDom = mount(newVNode);
  parent.replaceChild(newDom, domNode);
  return newDom;
}
