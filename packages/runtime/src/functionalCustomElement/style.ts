/**
 * Function to apply CSS styles to a shadow root
 *
 * @param shadowRoot Shadow root to apply styles to
 * @param css CSS string or array of strings containing styles
 * @returns Inserted style element
 */
export function applyStyles(shadowRoot: ShadowRoot, css: string | string[]): HTMLStyleElement {
  const cssText = Array.isArray(css) ? css.join("\n") : css;

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
