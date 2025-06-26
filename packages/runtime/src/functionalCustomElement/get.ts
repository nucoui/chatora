// Current active instance for external API calls
let currentCustomElementInstance: HTMLElement | null = null;

/**
 * Set the current custom element instance
 * @param instance - The custom element instance
 */
const setCurrentCustomElementInstance = (instance: HTMLElement | null) => {
  currentCustomElementInstance = instance;
};

/**
 * Returns the host element (current custom element instance)
 * This function can be imported and used externally
 * @returns HTMLElement or null if no context available
 */
const getHost = (): HTMLElement | null => {
  if (!currentCustomElementInstance) {
    console.warn("getHost: No custom element instance found. Make sure to call getHost during component execution.");
    return null;
  }
  return currentCustomElementInstance;
};

/**
 * Returns the ShadowRoot if it exists
 * This function can be imported and used externally
 * @returns ShadowRoot or null
 */
const getShadowRoot = (): ShadowRoot | null => {
  if (!currentCustomElementInstance) {
    console.warn("getShadowRoot: No custom element instance found. Make sure to call getShadowRoot during component execution.");
    return null;
  }
  return currentCustomElementInstance.shadowRoot;
};

/**
 * Returns ElementInternals if formAssociated is enabled
 * This function can be imported and used externally
 * @returns ElementInternals or null
 */
const getInternals = (): ElementInternals | null => {
  if (!currentCustomElementInstance) {
    console.warn("getInternals: No custom element instance found. Make sure to call getInternals during component execution.");
    return null;
  }

  const elementConstructor = currentCustomElementInstance.constructor as any;
  if (!elementConstructor.formAssociated || !("attachInternals" in currentCustomElementInstance)) {
    return null;
  }

  // Cache internals on the instance to avoid multiple attachInternals calls
  const internalsKey = "_chatora_internals";
  if (!(currentCustomElementInstance as any)[internalsKey]) {
    try {
      (currentCustomElementInstance as any)[internalsKey] = (currentCustomElementInstance as any).attachInternals();
    }
    catch {
      // attachInternals can fail for non-custom elements or other reasons
      return null;
    }
  }

  return (currentCustomElementInstance as any)[internalsKey];
};

export {
  getHost,
  getInternals,
  getShadowRoot,
  setCurrentCustomElementInstance,
};
