import type { stringToHast } from "@/main";
import type { ChatoraJSXElement, ChatoraNode } from "@chatora/runtime/JSX";
import { jsx } from "@chatora/runtime/jsx-runtime";

/**
 * Convert Hast (HTML Abstract Syntax Tree) to ChatoraJSXElement
 * @param hast - Hast object returned from stringToHast
 * @returns ChatoraJSXElement that can be rendered by Chatora
 */
export const hastToJsx = (hast: ReturnType<typeof stringToHast>): ChatoraJSXElement => {
  // Handle root element
  if (hast.type === "root") {
    // If root has no children, return empty fragment
    if (!hast.children || hast.children.length === 0) {
      return { tag: "#fragment", props: { children: [] } };
    }

    // Convert all children
    const children = hast.children.map(convertElementToJsx);

    // Return fragment with children
    return { tag: "#fragment", props: { children } };
  }

  // Handle single element - ensure it returns ChatoraJSXElement
  const result = convertElementToJsx(hast as any);
  if (typeof result === "string") {
    // Wrap string in a fragment
    return { tag: "#fragment", props: { children: [result] } };
  }
  return result as ChatoraJSXElement;
};

/**
 * Convert individual Hast element to ChatoraJSXElement or string
 * @param element - Hast element or text node
 * @returns ChatoraJSXElement or string for text nodes
 */
function convertElementToJsx(element: any): ChatoraNode {
  // Handle text nodes - return as string directly
  if (element.type === "text") {
    return element.value;
  }

  // Handle element nodes
  if (element.type === "element") {
    const { tagName, properties = {}, children = [] } = element;

    // Convert children recursively
    const jsxChildren = children.length > 0
      ? children.map(convertElementToJsx)
      : undefined;

    // Convert properties to JSX props
    const props: Record<string, any> = { ...properties };

    // Add children to props if they exist
    if (jsxChildren && jsxChildren.length > 0) {
      props.children = jsxChildren.length === 1 ? jsxChildren[0] : jsxChildren;
    }

    return jsx(tagName, props);
  }

  // Fallback for unknown node types
  return "";
}
