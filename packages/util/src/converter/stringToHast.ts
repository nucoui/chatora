import type { genDSD } from "@chatora/runtime";

// Define hast types for internal use
interface Element {
  type: "element";
  tagName: string;
  properties: Record<string, any>;
  children: Array<Element | Text>;
}

interface Text {
  type: "text";
  value: string;
}

interface Root {
  type: "root";
  children: Array<Element | Text>;
}

/**
 * Parse attributes from attribute string
 * @param attrStr - Attribute string like 'class="foo" id="bar"'
 * @returns Object with parsed attributes
 */
function parseAttributes(attrStr: string): Record<string, any> {
  const attributes: Record<string, any> = {};

  // Match attribute patterns: name="value", name='value', or name=value
  // Support word characters (letters, numbers, underscores), hyphens, and colons for maximum compatibility
  const attrRegex = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;

  // Use while loop with assignment
  // eslint-disable-next-line no-cond-assign
  while ((match = attrRegex.exec(attrStr)) !== null) {
    const [, name, doubleQuotedValue, singleQuotedValue, unquotedValue] = match;
    const value = doubleQuotedValue ?? singleQuotedValue ?? unquotedValue ?? "";

    // Convert boolean attributes
    if (value === "" && !doubleQuotedValue && !singleQuotedValue && !unquotedValue) {
      attributes[name] = true;
    }
    else {
      attributes[name] = value;
    }
  }

  return attributes;
}

/**
 * Parse HTML string into tokens
 * @param html - HTML string to parse
 * @returns Array of tokens
 */
function tokenize(html: string): Array<{ type: string; content: string; tagName?: string; attributes?: Record<string, any>; isClosing?: boolean; isSelfClosing?: boolean }> {
  const tokens: Array<{ type: string; content: string; tagName?: string; attributes?: Record<string, any>; isClosing?: boolean; isSelfClosing?: boolean }> = [];
  let position = 0;

  while (position < html.length) {
    const char = html[position];

    if (char === "<") {
      // Find the end of the tag
      const tagEnd = html.indexOf(">", position);
      if (tagEnd === -1) {
        // Malformed tag, treat as text
        tokens.push({ type: "text", content: char });
        position++;
        continue;
      }

      const tagContent = html.slice(position + 1, tagEnd);

      // Skip comments
      if (tagContent.startsWith("!--")) {
        const commentEnd = html.indexOf("-->", position);
        if (commentEnd !== -1) {
          position = commentEnd + 3;
          continue;
        }
      }

      // Check if it's a closing tag
      const isClosing = tagContent.startsWith("/");
      const isSelfClosing = tagContent.endsWith("/");

      let tagName = "";
      let attributesStr = "";

      if (isClosing) {
        tagName = tagContent.slice(1).trim();
      }
      else {
        const cleanContent = isSelfClosing ? tagContent.slice(0, -1) : tagContent;
        const spaceIndex = cleanContent.indexOf(" ");

        if (spaceIndex === -1) {
          tagName = cleanContent.trim();
        }
        else {
          tagName = cleanContent.slice(0, spaceIndex).trim();
          attributesStr = cleanContent.slice(spaceIndex + 1).trim();
        }
      }

      const attributes = attributesStr ? parseAttributes(attributesStr) : {};

      tokens.push({
        type: "tag",
        content: tagContent,
        tagName: tagName.toLowerCase(),
        attributes,
        isClosing,
        isSelfClosing,
      });

      position = tagEnd + 1;
    }
    else {
      // Collect text content
      let textContent = "";
      while (position < html.length && html[position] !== "<") {
        textContent += html[position];
        position++;
      }

      if (textContent.trim() !== "") {
        tokens.push({ type: "text", content: textContent });
      }
    }
  }

  return tokens;
}

/**
 * Self-closing HTML tags that don't need closing tags
 */
const SELF_CLOSING_TAGS = new Set([
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

/**
 * Build AST from tokens
 * @param tokens - Array of tokens
 * @returns Root element with children
 */
function buildAST(tokens: Array<{ type: string; content: string; tagName?: string; attributes?: Record<string, any>; isClosing?: boolean; isSelfClosing?: boolean }>): Root {
  const root: Root = { type: "root", children: [] };
  const stack: Array<Element> = [];
  const current = root;

  for (const token of tokens) {
    if (token.type === "text") {
      const textNode: Text = { type: "text", value: token.content };
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(textNode);
      }
      else {
        // Text at root level, add directly to root
        current.children.push(textNode);
      }
    }
    else if (token.type === "tag") {
      if (token.isClosing) {
        // Closing tag - pop from stack
        if (stack.length > 0 && stack[stack.length - 1].tagName === token.tagName) {
          stack.pop();
        }
      }
      else {
        // Opening tag
        const element: Element = {
          type: "element",
          tagName: token.tagName!,
          properties: token.attributes || {},
          children: [],
        };

        if (stack.length > 0) {
          stack[stack.length - 1].children.push(element);
        }
        else {
          current.children.push(element);
        }

        // If not self-closing, push to stack
        if (!token.isSelfClosing && !SELF_CLOSING_TAGS.has(token.tagName!)) {
          stack.push(element);
        }
      }
    }
  }

  return root;
}

/**
 * Parse HTML string to Hast without external dependencies
 * @param value - HTML string to convert
 * @returns Hast Root object compatible with functionalDeclarativeCustomElement
 */
export const stringToHast = (value: string): ReturnType<typeof genDSD> => {
  // Handle empty or null values
  if (!value || typeof value !== "string") {
    return {
      type: "root",
      children: [],
    };
  }

  // Trim and normalize the input
  const normalizedHTML = value.trim();

  if (normalizedHTML === "") {
    return {
      type: "root",
      children: [],
    };
  }

  try {
    // Tokenize the HTML string
    const tokens = tokenize(normalizedHTML);

    // Build AST from tokens
    const ast = buildAST(tokens);

    return ast;
  }
  catch (error) {
    // If parsing fails, return the string as text content
    console.warn("Failed to parse HTML string:", error);
    return {
      type: "root",
      children: [{ type: "text", value: normalizedHTML }],
    };
  }
};
