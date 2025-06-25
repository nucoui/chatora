// Pre-computed Set for pixel properties to avoid repeated array creation
const PIXEL_PROPERTIES = new Set([
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'font-size', 'letter-spacing', 'word-spacing',
  'top', 'right', 'bottom', 'left',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius', 
  'border-bottom-left-radius', 'border-bottom-right-radius',
  'outline-width', 'text-indent', 'column-gap', 'row-gap', 'gap'
]);

/**
 * Type definition for CSS style object
 */
export type CSSStyleObject = Record<string, string | number>;

/**
 * Type definition for style that can be string, string array, object, or mixed array
 */
export type StyleInput = string | CSSStyleObject | (string | CSSStyleObject)[];

/**
 * Convert style input to CSS string for DOM attributes (optimized single function)
 * 
 * @param style Style input (string, object, or array)
 * @returns CSS string for DOM attribute
 */
export function normalizeStyleForDOM(style: any): string {
  if (typeof style === 'string') {
    return style;
  }
  
  if (Array.isArray(style)) {
    return style.map(item => normalizeStyleForDOM(item)).join(' ');
  }
  
  if (typeof style === 'object' && style !== null) {
    // Convert style object to CSS string inline for better performance
    return Object.entries(style)
      .map(([property, value]) => {
        // Convert camelCase to kebab-case (optimized regex)
        const kebabProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        // Handle numeric values efficiently
        const cssValue = typeof value === 'number' && PIXEL_PROPERTIES.has(kebabProperty) 
          ? `${value}px` 
          : String(value);
        return `${kebabProperty}: ${cssValue};`;
      })
      .join(' ');
  }
  
  // Fallback to string conversion
  return String(style);
}

/**
 * Convert style input to CSS string for Shadow DOM (preserves newlines for readability)
 * 
 * @param style Style input (string, object, or array)
 * @returns CSS string with newlines between style blocks
 */
export function normalizeStyleForShadowDOM(style: any): string {
  if (typeof style === 'string') {
    return style;
  }
  
  if (Array.isArray(style)) {
    return style.map(item => normalizeStyleForShadowDOM(item)).join('\n');
  }
  
  if (typeof style === 'object' && style !== null) {
    // Convert style object to CSS string inline for better performance
    return Object.entries(style)
      .map(([property, value]) => {
        // Convert camelCase to kebab-case (optimized regex)
        const kebabProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        // Handle numeric values efficiently
        const cssValue = typeof value === 'number' && PIXEL_PROPERTIES.has(kebabProperty) 
          ? `${value}px` 
          : String(value);
        return `${kebabProperty}: ${cssValue};`;
      })
      .join(' ');
  }
  
  // Fallback to string conversion
  return String(style);
}
