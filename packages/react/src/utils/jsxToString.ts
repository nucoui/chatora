import type { ReactElement, ReactNode } from "react";
import { Fragment } from "react";

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped HTML text
 */
const escapeHtml = (text: string): string => {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, match => htmlEscapes[match] || match);
};

/**
 * Checks if an HTML tag is a void element (self-closing)
 * @param tagName - HTML tag name
 * @returns True if the tag is a void element
 */
const isVoidElement = (tagName: string): boolean => {
  const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  return voidElements.has(tagName.toLowerCase());
};

/**
 * Renders HTML attributes from props object
 * @param attributes - Props object containing attributes
 * @returns String representation of attributes
 */
const renderAttributes = (attributes: Record<string, any>): string => {
  const attrs: string[] = [];

  for (const [key, value] of Object.entries(attributes)) {
    // Skip certain React-specific props
    if (key === "key" || key === "ref" || key === "suppressHydrationWarning") {
      continue;
    }

    // Handle className
    if (key === "className") {
      if (value) {
        attrs.push(`class="${escapeHtml(String(value))}"`);
      }
      continue;
    }

    // Handle style object
    if (key === "style" && typeof value === "object" && value !== null) {
      const styleString = Object.entries(value)
        .map(([styleProp, styleValue]) => {
          // Convert camelCase to kebab-case
          const kebabProp = styleProp.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
          return `${kebabProp}:${styleValue}`;
        })
        .join(";");
      if (styleString) {
        attrs.push(`style="${escapeHtml(styleString)}"`);
      }
      continue;
    }

    // Handle boolean attributes
    if (typeof value === "boolean") {
      if (value) {
        attrs.push(key);
      }
      continue;
    }

    // Handle other attributes
    if (value !== null && value !== undefined) {
      attrs.push(`${key}="${escapeHtml(String(value))}"`);
    }
  }

  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
};

/**
 * Converts React JSX nodes to HTML string representation
 * Handles all types of ReactNode including elements, text, arrays, fragments, etc.
 * @param node - The React node to convert to string
 * @returns HTML string representation of the node
 */
export const jsxToString = (node: ReactNode): string => {
  // Handle null and undefined
  if (node === null || node === undefined) {
    return "";
  }

  // Handle boolean values
  if (typeof node === "boolean") {
    return "";
  }

  // Handle strings and numbers
  if (typeof node === "string" || typeof node === "number") {
    return escapeHtml(String(node));
  }

  // Handle arrays
  if (Array.isArray(node)) {
    return node.map(child => jsxToString(child)).join("");
  }

  // Handle React elements
  if (typeof node === "object" && "type" in node && "props" in node) {
    const element = node as ReactElement;

    // Handle React Fragment
    if (element.type === Fragment) {
      return jsxToString((element.props as any).children);
    }

    // Handle string-based elements (HTML tags)
    if (typeof element.type === "string") {
      const tagName = element.type;
      const props = (element.props as any) || {};
      const { children, ...attributes } = props;

      // Handle void elements (self-closing tags)
      if (isVoidElement(tagName)) {
        return `<${tagName}${renderAttributes(attributes)} />`;
      }

      // Handle regular elements
      const openTag = `<${tagName}${renderAttributes(attributes)}>`;
      const childrenString = jsxToString(children);
      const closeTag = `</${tagName}>`;

      return openTag + childrenString + closeTag;
    }

    // Handle function components and class components
    // Note: This is a simplified handling - in a real implementation,
    // you might want to render the component to get its output
    if (typeof element.type === "function") {
      // For function components, we can't easily render them without a React renderer
      // This is a limitation of static string conversion
      return `<!-- Function component: ${element.type.name || "Anonymous"} -->`;
    }
  }

  // Fallback for unknown types
  return "";
};
