import type { Signal } from "@chatora/reactivity";
import { onConnected } from "@/functionalCustomElement/on";
import { signal } from "@/functionalCustomElement/reactivity";

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
 * @returns Signal getter function for HTMLElement or null if no context available
 */
const getHost = (): Signal<HTMLElement | null>[0] => {
  const [hostElement, setHostElement] = signal<HTMLElement | null>(null);

  if (!currentCustomElementInstance) {
    console.warn("getHost: No custom element instance found. Make sure to call getHost during component execution.");
    return () => null;
  }

  onConnected(() => {
    if (!currentCustomElementInstance) {
      console.warn("getHost: No custom element instance found. Make sure to call getHost during component execution.");
      setHostElement(null);
      return;
    }

    setHostElement(currentCustomElementInstance);
  });

  return hostElement;
};

/**
 * Returns the ShadowRoot if it exists
 * This function can be imported and used externally
 * @returns Signal getter function for ShadowRoot or null
 */
const getShadowRoot = (): Signal<ShadowRoot | null>[0] => {
  const [shadowRoot, setShadowRoot] = signal<ShadowRoot | null>(null);

  if (!currentCustomElementInstance) {
    console.warn("getShadowRoot: No custom element instance found. Make sure to call getShadowRoot during component execution.");
    return () => null;
  }

  onConnected(() => {
    if (!currentCustomElementInstance) {
      console.warn("getShadowRoot: No custom element instance found. Make sure to call getShadowRoot during component execution.");
      setShadowRoot(null);
      return;
    }

    setShadowRoot(currentCustomElementInstance.shadowRoot);
  });

  return shadowRoot;
};

/**
 * Returns ElementInternals if formAssociated is enabled
 * This function can be imported and used externally
 * @returns Signal getter function for ElementInternals or null
 */
const getInternals = (): Signal<ElementInternals | null>[0] => {
  const [internals, setInternals] = signal<ElementInternals | null>(null);

  if (!currentCustomElementInstance) {
    console.warn("getInternals: No custom element instance found. Make sure to call getInternals during component execution.");
    return () => null;
  }

  onConnected(() => {
    if (!currentCustomElementInstance) {
      console.warn("getInternals: No custom element instance found. Make sure to call getInternals during component execution.");
      setInternals(null);
      return;
    }

    const elementConstructor = currentCustomElementInstance.constructor as any;
    if (!elementConstructor.formAssociated || !("attachInternals" in currentCustomElementInstance)) {
      setInternals(null);
      return;
    }

    // Cache internals on the instance to avoid multiple attachInternals calls
    const internalsKey = "_chatora_internals";

    if (!(currentCustomElementInstance as any)[internalsKey]) {
      try {
        (currentCustomElementInstance as any)[internalsKey] = currentCustomElementInstance.attachInternals();
      }
      catch {
        // attachInternals can fail for non-custom elements or other reasons
        setInternals(null);
        return;
      }
    }

    setInternals((currentCustomElementInstance as any)[internalsKey]);
  });

  return internals;
};

/**
 * Returns the slotted elements by slot name
 * This function can be imported and used externally
 * @param name - The name of the slot (optional, defaults to default slot)
 * @returns Element[] array of slotted elements
 */
const getSlotteds = (name?: string): Signal<Element[] | null>[0] => {
  const [slottedElements, setSlottedElements] = signal<Element[] | null>(null);
  if (!currentCustomElementInstance) {
    console.warn("getSlotteds: No custom element instance found. Make sure to call getSlotteds during component execution.");
    return () => null;
  }

  onConnected(() => {
    if (!currentCustomElementInstance) {
      console.warn("getSlotteds: No custom element instance found. Make sure to call getSlotteds during component execution.");
      setSlottedElements(null);
      return;
    }

    const elements = Array.from(
      currentCustomElementInstance.querySelectorAll(
        name ? `:scope > [slot="${name}"]` : ":scope > *",
      ),
    );

    if (elements) {
      setSlottedElements(elements);
    }
    else {
      console.warn("getSlotteds: No slotted content found.");
    }
  });

  return slottedElements;
};

export {
  getHost,
  getInternals,
  getShadowRoot,
  getSlotteds,
  setCurrentCustomElementInstance,
};
