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

  // Initialize the array if it doesn't exist
  if (!currentCustomElementContext.prototype.handleConnectedCallbacks) {
    currentCustomElementContext.prototype.handleConnectedCallbacks = [];
  }

  // Add the callback to the array
  currentCustomElementContext.prototype.handleConnectedCallbacks.push(callback);

  // Set or update the handleConnected method to execute all callbacks
  currentCustomElementContext.prototype.handleConnected = function () {
    this.handleConnectedCallbacks?.forEach((cb: () => void) => cb());
  };
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

  // Initialize the array if it doesn't exist
  if (!currentCustomElementContext.prototype.handleDisconnectedCallbacks) {
    currentCustomElementContext.prototype.handleDisconnectedCallbacks = [];
  }

  // Add the callback to the array
  currentCustomElementContext.prototype.handleDisconnectedCallbacks.push(callback);

  // Set or update the handleDisconnected method to execute all callbacks
  currentCustomElementContext.prototype.handleDisconnected = function () {
    this.handleDisconnectedCallbacks?.forEach((cb: () => void) => cb());
  };
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

  // Initialize the array if it doesn't exist
  if (!currentCustomElementContext.prototype.handleAttributeChangedCallbacks) {
    currentCustomElementContext.prototype.handleAttributeChangedCallbacks = [];
  }

  // Add the callback to the array
  currentCustomElementContext.prototype.handleAttributeChangedCallbacks.push(callback);

  // Set or update the handleAttributeChanged method to execute all callbacks
  currentCustomElementContext.prototype.handleAttributeChanged = function (name: string, oldValue: string | null, newValue: string | null) {
    this.handleAttributeChangedCallbacks?.forEach((cb: (name: string, oldValue: string | null, newValue: string | null) => void) =>
      cb(name, oldValue, newValue),
    );
  };
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

  // Initialize the array if it doesn't exist
  if (!currentCustomElementContext.prototype.handleAdoptedCallbacks) {
    currentCustomElementContext.prototype.handleAdoptedCallbacks = [];
  }

  // Add the callback to the array
  currentCustomElementContext.prototype.handleAdoptedCallbacks.push(callback);

  // Set or update the handleAdopted method to execute all callbacks
  currentCustomElementContext.prototype.handleAdopted = function () {
    this.handleAdoptedCallbacks?.forEach((cb: () => void) => cb());
  };
};

export {
  onAdopted,
  onAttributeChanged,
  onConnected,
  onDisconnected,
  setCurrentCustomElementContext,
};
