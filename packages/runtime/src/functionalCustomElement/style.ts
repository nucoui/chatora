import type { StyleInput } from "./styleObject";
import { normalizeStyleForShadowDOM } from "./styleObject";

/**
 * Function to apply CSS styles to a shadow root
 *
 * @param shadowRoot Shadow root to apply styles to
 * @param css CSS string, object, or array containing styles
 * @returns Inserted style element
 */
export function applyStyles(shadowRoot: ShadowRoot, css: StyleInput): HTMLStyleElement {
  const cssText = normalizeStyleForShadowDOM(css);

  // Check for existing style element
  const existingStyle = shadowRoot.querySelector("style");
  if (existingStyle) {
    existingStyle.textContent = cssText;
    return existingStyle;
  }

  // Create new style element
  const styleEl = document.createElement("style");
  styleEl.textContent = cssText;
  shadowRoot.appendChild(styleEl);
  return styleEl;
}
