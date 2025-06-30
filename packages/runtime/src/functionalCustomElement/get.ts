import type { Signal } from "@chatora/reactivity";
import { onConnected, onDisconnected } from "@/functionalCustomElement/on";
import { signal } from "@/functionalCustomElement/reactivity";

// Current active instance for external API calls
let currentCustomElementInstance: HTMLElement | null = null;

// Global observer management for slotted elements
const slottedObservers = new WeakMap<HTMLElement, {
  observer: MutationObserver;
  subscribers: Map<string | undefined, Set<() => void>>;
}>();

// Global management for host element subscriptions
const hostSubscribers = new WeakMap<HTMLElement, Set<() => void>>();

// Global management for shadow root subscriptions
const shadowRootSubscribers = new WeakMap<HTMLElement, Set<() => void>>();

// Global management for internals subscriptions
const internalsSubscribers = new WeakMap<HTMLElement, Set<() => void>>();
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
const getHost = (): Omit<Signal<HTMLElement | null>, "set"> => {
  const hostElement = signal<HTMLElement | null>(null);

  if (!currentCustomElementInstance) {
    console.warn("getHost: No custom element instance found. Make sure to call getHost during component execution.");
    return {
      get value() {
        return hostElement.value;
      },
      run: () => {
        return hostElement.value;
      },
    };
  }

  const instance = currentCustomElementInstance;

  /**
   * Update host element based on current state
   */
  const updateHostElement = () => {
    if (!instance) {
      hostElement.set(null);
      return;
    }
    hostElement.set(instance);
  };

  /**
   * Setup or get existing subscribers for this element
   */
  const setupSubscription = () => {
    if (!instance)
      return;

    let subscribers = hostSubscribers.get(instance);

    if (!subscribers) {
      subscribers = new Set();
      hostSubscribers.set(instance, subscribers);
    }

    // Add this update function to subscribers
    subscribers.add(updateHostElement);
  };

  /**
   * Cleanup this host subscription
   */
  const cleanupSubscription = () => {
    if (!instance)
      return;

    const subscribers = hostSubscribers.get(instance);
    if (subscribers) {
      subscribers.delete(updateHostElement);

      // If no more subscribers, remove the entry
      if (subscribers.size === 0) {
        hostSubscribers.delete(instance);
      }
    }
  };

  onConnected(() => {
    // Initial update
    updateHostElement();

    // Setup subscription
    setupSubscription();
  });

  onDisconnected(() => {
    // Cleanup subscription
    cleanupSubscription();
  });

  return {
    get value() {
      return hostElement.value;
    },
    run: () => {
      return hostElement.value;
    },
  };
};

/**
 * Returns the ShadowRoot if it exists
 * This function can be imported and used externally
 * @returns Signal getter function for ShadowRoot or null
 */
const getShadowRoot = (): Omit<Signal<ShadowRoot | null>, "set"> => {
  const shadowRoot = signal<ShadowRoot | null>(null);

  if (!currentCustomElementInstance) {
    console.warn("getShadowRoot: No custom element instance found. Make sure to call getShadowRoot during component execution.");
    return {
      get value() {
        return shadowRoot.value;
      },
      run: () => {
        return shadowRoot.value;
      },
    };
  }

  const instance = currentCustomElementInstance;

  /**
   * Update shadow root based on current state
   */
  const updateShadowRoot = () => {
    if (!instance) {
      shadowRoot.set(null);
      return;
    }
    shadowRoot.set(instance.shadowRoot);
  };

  /**
   * Setup or get existing subscribers for this element
   */
  const setupSubscription = () => {
    if (!instance)
      return;

    let subscribers = shadowRootSubscribers.get(instance);

    if (!subscribers) {
      subscribers = new Set();
      shadowRootSubscribers.set(instance, subscribers);
    }

    // Add this update function to subscribers
    subscribers.add(updateShadowRoot);
  };

  /**
   * Cleanup this shadow root subscription
   */
  const cleanupSubscription = () => {
    if (!instance)
      return;

    const subscribers = shadowRootSubscribers.get(instance);
    if (subscribers) {
      subscribers.delete(updateShadowRoot);

      // If no more subscribers, remove the entry
      if (subscribers.size === 0) {
        shadowRootSubscribers.delete(instance);
      }
    }
  };

  onConnected(() => {
    // Initial update
    updateShadowRoot();

    // Setup subscription
    setupSubscription();
  });

  onDisconnected(() => {
    // Cleanup subscription
    cleanupSubscription();
  });

  return {
    get value() {
      return shadowRoot.value;
    },
    run: () => {
      return shadowRoot.value;
    },
  };
};

/**
 * Returns ElementInternals if formAssociated is enabled
 * This function can be imported and used externally
 * @returns Signal getter function for ElementInternals or null
 */
const getInternals = (): Omit<Signal<ElementInternals | null>, "set"> => {
  const internals = signal<ElementInternals | null>(null);

  if (!currentCustomElementInstance) {
    console.warn("getInternals: No custom element instance found. Make sure to call getInternals during component execution.");
    return {
      get value() {
        return internals.value;
      },
      run: () => {
        return internals.value;
      },
    };
  }

  const instance = currentCustomElementInstance;

  /**
   * Update internals based on current state
   */
  const updateInternals = () => {
    if (!instance) {
      internals.set(null);
      return;
    }

    const elementConstructor = instance.constructor as any;
    if (!elementConstructor.formAssociated || !("attachInternals" in instance)) {
      internals.set(null);
      return;
    }

    // Cache internals on the instance to avoid multiple attachInternals calls
    const internalsKey = "_chatora_internals";

    if (!(instance as any)[internalsKey]) {
      try {
        (instance as any)[internalsKey] = instance.attachInternals();
      }
      catch {
        // attachInternals can fail for non-custom elements or other reasons
        internals.set(null);
        return;
      }
    }

    internals.set((instance as any)[internalsKey]);
  };

  /**
   * Setup or get existing subscribers for this element
   */
  const setupSubscription = () => {
    if (!instance)
      return;

    let subscribers = internalsSubscribers.get(instance);

    if (!subscribers) {
      subscribers = new Set();
      internalsSubscribers.set(instance, subscribers);
    }

    // Add this update function to subscribers
    subscribers.add(updateInternals);
  };

  /**
   * Cleanup this internals subscription
   */
  const cleanupSubscription = () => {
    if (!instance)
      return;

    const subscribers = internalsSubscribers.get(instance);
    if (subscribers) {
      subscribers.delete(updateInternals);

      // If no more subscribers, remove the entry
      if (subscribers.size === 0) {
        internalsSubscribers.delete(instance);
      }
    }
  };

  onConnected(() => {
    // Initial update
    updateInternals();

    // Setup subscription
    setupSubscription();
  });

  onDisconnected(() => {
    // Cleanup subscription
    cleanupSubscription();
  });

  return {
    get value() {
      return internals.value;
    },
    run: () => {
      return internals.value;
    },
    };
};

/**
 * Returns the slotted elements by slot name
 * This function can be imported and used externally
 * @param name - The name of the slot (optional, defaults to default slot)
 * @returns Element[] array of slotted elements
 */
const getSlotteds = (name?: string): Omit<Signal<Element[] | null>, "set"> => {
  const slottedElements = signal<Element[] | null>(null);

  if (!currentCustomElementInstance) {
    console.warn("getSlotteds: No custom element instance found. Make sure to call getSlotteds during component execution.");
    return {
      get value() {
        return slottedElements.value;
      },
      run: () => {
        return slottedElements.value;
      },
    };
  }

  const hostElement = currentCustomElementInstance;

  /**
   * Update slotted elements based on current DOM state
   */
  const updateSlottedElements = () => {
    if (!hostElement) {
      slottedElements.set(null);
      return;
    }

    const elements = Array.from(
      hostElement.querySelectorAll(
        name ? `:scope > [slot="${name}"]` : ":scope > *",
      ),
    );

    slottedElements.set(elements.length > 0 ? elements : null);
  };

  /**
   * Setup or get existing observer for this element
   */
  const setupObserver = () => {
    if (!hostElement)
      return;

    let observerData = slottedObservers.get(hostElement);

    if (!observerData) {
      // Create new observer for this element
      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;

        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            // Any child list change should trigger update for slot monitoring
            shouldUpdate = true;
            break;
          }
          else if (mutation.type === "attributes" && mutation.attributeName === "slot") {
            // Slot attribute changed
            shouldUpdate = true;
            break;
          }
        }

        if (shouldUpdate) {
          // Notify all subscribers
          const subscribers = observerData?.subscribers;
          if (subscribers) {
            for (const slotSubscribers of subscribers.values()) {
              for (const callback of slotSubscribers) {
                callback();
              }
            }
          }
        }
      });

      observerData = {
        observer,
        subscribers: new Map(),
      };

      slottedObservers.set(hostElement, observerData);

      // Start observing
      observer.observe(hostElement, {
        childList: true,
        subtree: false, // Only direct children
        attributes: true,
        attributeFilter: ["slot"],
      });
    }

    // Add this slot's update function to subscribers
    if (!observerData.subscribers.has(name)) {
      observerData.subscribers.set(name, new Set());
    }
    observerData.subscribers.get(name)!.add(updateSlottedElements);
  };

  /**
   * Cleanup this slot's subscription
   */
  const cleanupObserver = () => {
    if (!hostElement)
      return;

    const observerData = slottedObservers.get(hostElement);
    if (observerData) {
      const slotSubscribers = observerData.subscribers.get(name);
      if (slotSubscribers) {
        slotSubscribers.delete(updateSlottedElements);

        // If no more subscribers for this slot, remove the slot entry
        if (slotSubscribers.size === 0) {
          observerData.subscribers.delete(name);
        }

        // If no more subscribers at all, cleanup the observer
        if (observerData.subscribers.size === 0) {
          observerData.observer.disconnect();
          slottedObservers.delete(hostElement);
        }
      }
    }
  };

  onConnected(() => {
    // Initial update
    updateSlottedElements();

    // Setup observer
    setupObserver();
  });

  onDisconnected(() => {
    // Cleanup observer subscription
    cleanupObserver();
  });

  return {
    get value() {
      return slottedElements.value;
    },
    run: () => {
      return slottedElements.value;
    },
  };
};

export {
  getHost,
  getInternals,
  getShadowRoot,
  getSlotteds,
  setCurrentCustomElementInstance,
};
