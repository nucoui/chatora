// Context interface for custom element constructors
interface CustomElementConstructorContext {
  constructor: any;
  isActive: boolean;
}

// WeakMap to store context for each constructor
const constructorContexts = new WeakMap<any, CustomElementConstructorContext>();

// Current active constructor stack to handle nested contexts
const activeConstructorStack: any[] = [];

/**
 * Get the current custom element constructor context from context stack
 * @returns Current active constructor or null if no context available
 */
const getCurrentCustomElementContext = (): any => {
  return activeConstructorStack.length > 0 ? activeConstructorStack[activeConstructorStack.length - 1] : null;
};

/**
 * Push a custom element constructor to the context stack
 * @param constructor - The custom element constructor to push
 */
const pushCustomElementContext = (constructor: any) => {
  // Ensure context exists for this constructor
  if (!constructorContexts.has(constructor)) {
    constructorContexts.set(constructor, {
      constructor,
      isActive: false,
    });
  }

  // Add to stack if not already present
  if (!activeConstructorStack.includes(constructor)) {
    activeConstructorStack.push(constructor);
  }

  // Mark as active
  const context = constructorContexts.get(constructor)!;
  context.isActive = true;
};

/**
 * Pop the last custom element constructor from the context stack
 * @returns The popped constructor or null if stack is empty
 */
const popCustomElementContext = (): any => {
  const popped = activeConstructorStack.pop();
  if (popped) {
    const context = constructorContexts.get(popped);
    if (context) {
      context.isActive = false;
    }
  }
  return popped || null;
};

/**
 * Set the current custom element context (backward compatibility)
 * @param context - The custom element constructor context
 */
const setCurrentCustomElementContext = (context: any) => {
  if (context === null) {
    // Clear the entire stack for backward compatibility
    activeConstructorStack.length = 0;
    return;
  }

  // Clear stack and set this context for backward compatibility
  activeConstructorStack.length = 0;
  pushCustomElementContext(context);
};

/**
 * Execute a function within a specific custom element constructor context
 * @param constructor - The custom element constructor to use as context
 * @param fn - The function to execute
 * @returns The result of the function execution
 * @internal
 */
const _withCustomElementConstructorContext = <T>(constructor: any, fn: () => T): T => {
  pushCustomElementContext(constructor);
  try {
    return fn();
  }
  finally {
    popCustomElementContext();
  }
};

/**
 * Register a callback to be called when the custom element is connected to the DOM
 * This function can be imported and used externally
 * @param callback - Function to call when connected
 */
const onConnected = (callback: () => void | Promise<void>) => {
  const currentCustomElementContext = getCurrentCustomElementContext();
  if (!currentCustomElementContext) {
    // Only show warnings in development
    typeof window !== "undefined" && console.warn("onConnected: No custom element context found. Make sure to call onConnected during component definition.");
    return;
  }

  // Initialize the array if it doesn't exist
  if (!currentCustomElementContext.prototype.handleConnectedCallbacks) {
    currentCustomElementContext.prototype.handleConnectedCallbacks = [];

    // Set the handleConnected method once to execute all callbacks
    currentCustomElementContext.prototype.handleConnected = async function () {
      for (const cb of this.handleConnectedCallbacks) {
        try {
          await cb();
        }
        catch (error) {
          // Continue executing other callbacks even if one fails
          console.error("Error in onConnected callback:", error);
        }
      }
    };
  }

  // Add the callback to the array
  currentCustomElementContext.prototype.handleConnectedCallbacks.push(callback);
};

/**
 * Register a callback to be called when the custom element is disconnected from the DOM
 * This function can be imported and used externally
 * @param callback - Function to call when disconnected
 */
const onDisconnected = (callback: () => void | Promise<void>) => {
  const currentCustomElementContext = getCurrentCustomElementContext();
  if (!currentCustomElementContext) {
    // Only show warnings in development
    typeof window !== "undefined" && console.warn("onDisconnected: No custom element context found. Make sure to call onDisconnected during component definition.");
    return;
  }

  // Initialize the array if it doesn't exist
  if (!currentCustomElementContext.prototype.handleDisconnectedCallbacks) {
    currentCustomElementContext.prototype.handleDisconnectedCallbacks = [];

    // Set the handleDisconnected method once to execute all callbacks
    currentCustomElementContext.prototype.handleDisconnected = async function () {
      for (const cb of this.handleDisconnectedCallbacks) {
        try {
          await cb();
        }
        catch (error) {
          // Continue executing other callbacks even if one fails
          console.error("Error in onDisconnected callback:", error);
        }
      }
    };
  }

  // Add the callback to the array
  currentCustomElementContext.prototype.handleDisconnectedCallbacks.push(callback);
};

/**
 * Register a callback to be called when the custom element's attributes change
 * This function can be imported and used externally
 * @param callback - Function to call when attributes change
 */
const onAttributeChanged = (callback: (name: string, oldValue: string | null, newValue: string | null) => void | Promise<void>) => {
  const currentCustomElementContext = getCurrentCustomElementContext();
  if (!currentCustomElementContext) {
    // Only show warnings in development
    typeof window !== "undefined" && console.warn("onAttributeChanged: No custom element context found. Make sure to call onAttributeChanged during component definition.");
    return;
  }

  // Initialize the array if it doesn't exist
  if (!currentCustomElementContext.prototype.handleAttributeChangedCallbacks) {
    currentCustomElementContext.prototype.handleAttributeChangedCallbacks = [];

    // Set the handleAttributeChanged method once to execute all callbacks
    currentCustomElementContext.prototype.handleAttributeChanged = async function (name: string, oldValue: string | null, newValue: string | null) {
      for (const cb of this.handleAttributeChangedCallbacks) {
        try {
          await cb(name, oldValue, newValue);
        }
        catch (error) {
          // Continue executing other callbacks even if one fails
          console.error("Error in onAttributeChanged callback:", error);
        }
      }
    };
  }

  // Add the callback to the array
  currentCustomElementContext.prototype.handleAttributeChangedCallbacks.push(callback);
};

/**
 * Register a callback to be called when the custom element is adopted to a new document
 * This function can be imported and used externally
 * @param callback - Function to call when adopted
 */
const onAdopted = (callback: () => void | Promise<void>) => {
  const currentCustomElementContext = getCurrentCustomElementContext();
  if (!currentCustomElementContext) {
    // Only show warnings in development
    typeof window !== "undefined" && console.warn("onAdopted: No custom element context found. Make sure to call onAdopted during component definition.");
    return;
  }

  // Initialize the array if it doesn't exist
  if (!currentCustomElementContext.prototype.handleAdoptedCallbacks) {
    currentCustomElementContext.prototype.handleAdoptedCallbacks = [];

    // Set the handleAdopted method once to execute all callbacks
    currentCustomElementContext.prototype.handleAdopted = async function () {
      for (const cb of this.handleAdoptedCallbacks) {
        try {
          await cb();
        }
        catch (error) {
          // Continue executing other callbacks even if one fails
          console.error("Error in onAdopted callback:", error);
        }
      }
    };
  }

  // Add the callback to the array
  currentCustomElementContext.prototype.handleAdoptedCallbacks.push(callback);
};

export {
  onAdopted,
  onAttributeChanged,
  onConnected,
  onDisconnected,
  setCurrentCustomElementContext,
};
