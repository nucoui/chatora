import type { ReactElement } from "react";
import { Fragment, jsx } from "react/jsx-runtime";

/**
 * Convert HAST (Hypertext Abstract Syntax Tree) to React JSX element.
 * @param hast - HAST node to convert
 * @param key - React key
 * @returns Converted React JSX element
 */
export const hastToJsx = (hast: any, key?: string): ReactElement => {
  // null/undefined
  if (!hast) {
    return jsx("div", {}, key);
  }

  // root
  if (hast.type === "root") {
    const rootChildren = hast.children.map((child: any, index: number) => {
      if (child.type === "text")
        return child.value;
      return hastToJsx(child, `${key}-root-${index}`);
    });
    return jsx(Fragment, { children: rootChildren }, key);
  }

  // text
  if (hast.type === "text") {
    return jsx(Fragment, { children: hast.value }, key);
  }

  // element以外
  if (hast.type !== "element") {
    return jsx("div", {}, key);
  }

  // props変換
  const props: Record<string, any> = {};
  if (hast.properties) {
    Object.entries(hast.properties).forEach(([propName, propValue]) => {
      if (propName === "class")
        props.className = propValue;
      else props[propName] = propValue;
    });
  }

  // 子要素
  const nodeChildren = hast.children.length > 0
    ? hast.children.map((child: any, index: number) => {
        if (child.type === "text")
          return child.value;
        return hastToJsx(child, `${key}-child-${index}`);
      })
    : undefined;

  // styleタグ特別処理
  if (hast.tagName === "style") {
    let styleContent = "";
    if (hast.children && hast.children.length > 0) {
      styleContent = hast.children
        .filter((child: any) => child.type === "text")
        .map((child: any) => child.value)
        .join("");
    }
    return jsx("style", { ...props, children: styleContent }, key);
  }

  return jsx(hast.tagName as any, { ...props, children: nodeChildren }, key);
};
