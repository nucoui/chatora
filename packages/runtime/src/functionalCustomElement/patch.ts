import type { VNode } from "@/functionalCustomElement/vNode";
import { mount } from "@/functionalCustomElement/mount";

/**
 * Optimized props patching with minimal DOM operations
 */
function patchProps(el: HTMLElement, oldProps: Record<string, any>, newProps: Record<string, any>) {
  if (oldProps === newProps)
    return;

  // Pre-calculate which props to remove and add
  const toRemove: string[] = [];
  const toUpdate: Array<[string, any]> = [];

  // Check props to remove
  for (const k in oldProps) {
    if (!(k in newProps)) {
      toRemove.push(k);
    }
  }

  // Check props to add/update
  for (const k in newProps) {
    const newVal = newProps[k];
    if (newVal !== oldProps[k]) {
      toUpdate.push([k, newVal]);
    }
  }

  // Batch remove operations
  for (let i = 0; i < toRemove.length; i++) {
    const k = toRemove[i];
    if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110) { // "on"
      el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
    }
    else {
      el.removeAttribute(k);
    }
  }

  // Batch update operations
  for (let i = 0; i < toUpdate.length; i++) {
    const [k, newVal] = toUpdate[i];

    if (newVal == null) {
      el.removeAttribute(k);
      continue;
    }

    if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110) { // "on"
      if (oldProps[k]) {
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
      }
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

/**
 * Highly optimized children patching with minimal DOM operations
 */
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

  // Fast path: all strings with same length
  if (oldLen === newLen && oldLen > 0) {
    let allStringsMatch = true;
    for (let i = 0; i < oldLen; i++) {
      if (typeof oldChildren[i] !== "string" || typeof newChildren[i] !== "string") {
        allStringsMatch = false;
        break;
      }
    }

    if (allStringsMatch) {
      for (let i = 0; i < oldLen; i++) {
        if (oldChildren[i] !== newChildren[i]) {
          const childDom = getChildDom(i);
          if (childDom && childDom.nodeType === Node.TEXT_NODE) {
            childDom.textContent = newChildren[i] as string;
          }
        }
      }
      return;
    }
  }

  // Optimized diff algorithm
  const maxLen = Math.max(oldLen, newLen);
  const operations: Array<{ type: "patch" | "add" | "remove"; index: number; oldChild?: VNode | string; newChild?: VNode | string; dom?: Node | null }> = [];

  // Collect operations first
  for (let i = 0; i < maxLen; i++) {
    const oldChild = i < oldLen ? oldChildren[i] : undefined;
    const newChild = i < newLen ? newChildren[i] : undefined;
    const dom = getChildDom(i);

    if (oldChild && newChild) {
      operations.push({ type: "patch", index: i, oldChild, newChild, dom });
    }
    else if (!oldChild && newChild) {
      operations.push({ type: "add", index: i, newChild });
    }
    else if (oldChild && !newChild) {
      operations.push({ type: "remove", index: i, dom });
    }
  }

  // Execute operations in reverse order to avoid index shifting
  for (let i = operations.length - 1; i >= 0; i--) {
    const op = operations[i];

    switch (op.type) {
      case "patch":
        if (op.dom && op.oldChild && op.newChild) {
          if (typeof op.oldChild === "string" && typeof op.newChild === "string") {
            if (op.oldChild !== op.newChild && op.dom instanceof Text) {
              op.dom.textContent = op.newChild;
            }
          }
          else if (typeof op.oldChild === "string" || typeof op.newChild === "string") {
            const newNode = typeof op.newChild === "string"
              ? document.createTextNode(op.newChild)
              : mount(op.newChild);
            if (parent instanceof Element || parent instanceof ShadowRoot) {
              parent.replaceChild(newNode, op.dom);
            }
          }
          else {
            patch(op.oldChild, op.newChild, parent, op.dom);
          }
        }
        break;

      case "add":
        if (op.newChild) {
          const newNode = typeof op.newChild === "string"
            ? document.createTextNode(op.newChild)
            : mount(op.newChild);
          if (parent instanceof Element || parent instanceof ShadowRoot) {
            if (insertRef) {
              parent.insertBefore(newNode, insertRef);
            }
            else {
              parent.appendChild(newNode);
            }
          }
        }
        break;

      case "remove":
        if (op.dom && (parent instanceof Element || parent instanceof ShadowRoot)) {
          parent.removeChild(op.dom);
        }
        break;
    }
  }
}

/**
 * Patch the DOM by comparing oldVNode and newVNode, updating only the changed parts.
 * Optimized for performance with early returns and minimal DOM operations.
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
  // Fast path: identical VNode objects
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

  // Early return: tag changed, replace entire node
  if (oldTag !== newTag) {
    const newDom = mount(newVNode);
    parent.replaceChild(newDom, domNode);
    return newDom;
  }

  // Optimized text node handling
  if (newTag === "#text") {
    if (domNode.nodeType === Node.TEXT_NODE) {
      const oldText = oldVNode.children.join("");
      const newText = newVNode.children.join("");
      if (oldText !== newText) {
        domNode.textContent = newText;
      }
      return domNode;
    }
    // Type mismatch - replace node
    const newDom = mount(newVNode);
    parent.replaceChild(newDom, domNode);
    return newDom;
  }

  // Empty node - no changes needed
  if (newTag === "#empty") {
    return domNode;
  }

  // Normal HTML element - optimized property and children diffing
  if (typeof newTag === "string" && newTag !== "#fragment") {
    const el = domNode as HTMLElement;

    // Only diff props if they actually changed
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};
    if (oldProps !== newProps) {
      patchProps(el, oldProps, newProps);
    }

    // Only diff children if they changed
    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];
    if (oldChildren !== newChildren) {
      patchChildren(
        oldChildren,
        newChildren,
        el,
        idx => el.childNodes[idx] || null,
      );
    }

    return el;
  }

  // Fallback: mount new node
  const newDom = mount(newVNode);
  parent.replaceChild(newDom, domNode);
  return newDom;
}
