/**
 * スタイルをシャドウルートに適用する関数
 * Function to apply CSS styles to a shadow root
 *
 * @param shadowRoot スタイルを適用するシャドウルート
 * @param css CSSスタイリングを含む文字列、または文字列の配列
 * @returns 挿入されたスタイル要素
 */
export function applyStyles(shadowRoot: ShadowRoot, css: string | string[]): HTMLStyleElement {
  const cssText = Array.isArray(css) ? css.join("\n") : css;

  // 既存のスタイル要素を確認
  const existingStyle = shadowRoot.querySelector("style");
  if (existingStyle) {
    existingStyle.textContent = cssText;
    return existingStyle;
  }

  // 新しいスタイル要素を作成
  const styleEl = document.createElement("style");
  styleEl.textContent = cssText;
  shadowRoot.appendChild(styleEl);
  return styleEl;
}
