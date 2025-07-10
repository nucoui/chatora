import type { functionalDeclarativeCustomElement } from "chatora";
import type { ReactElement } from "react";
import { Fragment, jsx } from "react/jsx-runtime";

/**
 * Type alias for HAST root returned by functionalDeclarativeCustomElement
 */
type HastRoot = ReturnType<typeof functionalDeclarativeCustomElement>;

/**
 * Convert HAST children to HTML string for dangerouslySetInnerHTML with style consolidation
 * @param children - Child elements to convert
 * @returns HTML string suitable for dangerouslySetInnerHTML
 */
function childrenToHtmlString(children: Array<any>): string {
  const processedChildren: string[] = [];
  let combinedStyleContent = "";

  // First pass: collect all style content and process other elements
  children.forEach((child) => {
    if (!child) {
      return;
    }

    if (child.type === "text") {
      processedChildren.push(escapeHtml(child.value));
    }
    else if (child.type === "element") {
      if (child.tagName === "style") {
        // Collect style content instead of creating individual elements
        const styleText = child.children
          .filter((styleChild: any) => styleChild.type === "text")
          .map((styleChild: any) => styleChild.value)
          .join("");
        combinedStyleContent += styleText;
      }
      else {
        const { tagName, properties = {}, children: elementChildren = [] } = child;

        // Convert properties to HTML attributes
        const attributes = Object.entries(properties)
          .map(([key, value]) => {
            if (value === true) {
              return key;
            }
            if (value === false || value === null || value === undefined) {
              return "";
            }
            return `${key}="${escapeHtml(String(value))}"`;
          })
          .filter(Boolean)
          .join(" ");

        const attrsString = attributes ? ` ${attributes}` : "";

        // Handle self-closing tags
        if (isSelfClosingTag(tagName)) {
          processedChildren.push(`<${tagName}${attrsString} />`);
        }
        else {
          // Handle regular tags
          const childrenHtml = childrenToHtmlString(elementChildren);
          processedChildren.push(`<${tagName}${attrsString}>${childrenHtml}</${tagName}>`);
        }
      }
    }
  });

  // Add combined style element if there's any style content
  const result: string[] = [];
  if (combinedStyleContent) {
    result.push(`<style>${combinedStyleContent}</style>`);
  }
  result.push(...processedChildren);

  return result.join("");
}

/**
 * Escape HTML special characters
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Check if tag is self-closing
 * @param tagName - Tag name to check
 * @returns True if tag is self-closing
 */
function isSelfClosingTag(tagName: string): boolean {
  const selfClosingTags = new Set([
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
  return selfClosingTags.has(tagName.toLowerCase());
}

/**
 * Process individual HAST element recursively
 * @param element - HAST element to process
 * @param key - React key
 * @returns React element
 */
function processElement(element: any, key: string): ReactElement {
  const { tagName, properties = {}, children = [] } = element;

  // Convert properties to props
  const props: Record<string, unknown> = {};
  Object.entries(properties).forEach(([propName, propValue]) => {
    if (propName === "class") {
      props.className = propValue;
    }
    else {
      props[propName] = propValue;
    }
  });

  // Special handling for template tags
  if (tagName === "template") {
    // Template tag: return JSX element with children as dangerouslySetInnerHTML
    const htmlContent = childrenToHtmlString(children);

    return jsx("template", {
      ...props,
      dangerouslySetInnerHTML: {
        __html: htmlContent,
      },
    }, key);
  }

  // Handle other elements normally
  const nodeChildren = children.length > 0
    ? children.map((child: any, index: number) => {
      if (child.type === "text") {
        return child.value;
      }
      if (child.type === "element") {
        return processElement(child, `${key}-child-${index}`);
      }
      return "";
    })
    : undefined;

  // Handle style tags specially (preserve as JSX with text content)
  if (tagName === "style") {
    let styleContent = "";
    if (children.length > 0) {
      styleContent = children
        .filter((child: any) => child.type === "text")
        .map((child: any) => child.value)
        .join(""); // Concatenate all text content without separators
    }
    return jsx("style", { ...props, children: styleContent }, key);
  }

  return jsx(tagName as keyof JSX.IntrinsicElements, { ...props, children: nodeChildren }, key);
}

/**
 * Convert HAST (Hypertext Abstract Syntax Tree) to React JSX element with special handling for template tags.
 * Template tags are returned as JSX elements, while their children are rendered as HTML strings in dangerouslySetInnerHTML.
 * @param hast - HAST node to convert
 * @param key - React key
 * @returns Converted React JSX element
 */
export const hastToJsx = (hast: HastRoot, key?: string): ReactElement => {
  // Handle null/undefined
  if (!hast) {
    return jsx("div", {}, key);
  }

  // Handle root
  if (hast.type === "root") {
    const processedChildren: ReactElement[] = [];
    let combinedStyleContent = "";

    // First pass: collect all style content and process other elements
    hast.children.forEach((child, index: number) => {
      if (child.type === "text") {
        processedChildren.push(jsx(Fragment, { children: child.value }, `${key || "hast"}-text-${index}`));
      }
      else if (child.type === "element") {
        if (child.tagName === "style") {
          // Collect style content instead of creating individual elements
          const styleText = child.children
            .filter((styleChild: any) => styleChild.type === "text")
            .map((styleChild: any) => styleChild.value)
            .join("");
          combinedStyleContent += styleText;
        }
        else {
          processedChildren.push(processElement(child, `${key || "hast"}-root-${index}`));
        }
      }
    });

    // Add combined style element if there's any style content
    if (combinedStyleContent) {
      processedChildren.unshift(
        jsx("style", { children: combinedStyleContent }, `${key || "hast"}-combined-style`),
      );
    }

    return jsx(Fragment, { children: processedChildren }, key);
  }

  return jsx("div", {}, key);
};
