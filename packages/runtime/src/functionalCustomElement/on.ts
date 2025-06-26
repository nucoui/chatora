// Global context to track the current custom element being defined
let currentCustomElementContext: any = null;

/**
 * Set the current custom element context (used internally by functionalCustomElement)
 * @param context - The custom element constructor context
 */
const setCurrentCustomElementContext = (context: any) => {
  currentCustomElementContext = context;
};

/**
 * Register a callback to be called when the custom element is connected to the DOM
 * This function can be imported and used externally
 * @param callback - Function to call when connected
 */
const onConnected = (callback: () => void) => {
  if (!currentCustomElementContext) {
    // Only show warnings in development
    console.warn("onConnected: No custom element context found. Make sure to call onConnected during component definition.");
    return;
  }

  currentCustomElementContext.prototype.handleConnected = callback;
};

/**
 * Register a callback to be called when the custom element is disconnected from the DOM
 * This function can be imported and used externally
 * @param callback - Function to call when disconnected
 */
const onDisconnected = (callback: () => void) => {
  if (!currentCustomElementContext) {
    // Only show warnings in development
    console.warn("onDisconnected: No custom element context found. Make sure to call onDisconnected during component definition.");
    return;
  }

  currentCustomElementContext.prototype.handleDisconnected = callback;
};

/**
 * Register a callback to be called when the custom element's attributes change
 * This function can be imported and used externally
 * @param callback - Function to call when attributes change
 */
const onAttributeChanged = (callback: (name: string, oldValue: string | null, newValue: string | null) => void) => {
  if (!currentCustomElementContext) {
    // Only show warnings in development
    console.warn("onAttributeChanged: No custom element context found. Make sure to call onAttributeChanged during component definition.");
    return;
  }

  currentCustomElementContext.prototype.handleAttributeChanged = callback;
};

/**
 * Register a callback to be called when the custom element is adopted to a new document
 * This function can be imported and used externally
 * @param callback - Function to call when adopted
 */
const onAdopted = (callback: () => void) => {
  if (!currentCustomElementContext) {
    // Only show warnings in development
    console.warn("onAdopted: No custom element context found. Make sure to call onAdopted during component definition.");
    return;
  }

  currentCustomElementContext.prototype.handleAdopted = callback;
};

export {
  onAdopted,
  onAttributeChanged,
  onConnected,
  onDisconnected,
  setCurrentCustomElementContext,
};
