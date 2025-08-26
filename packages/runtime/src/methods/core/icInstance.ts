/**
 * InlineComponent (IC) Instance Management
 * 
 * Provides lifecycle management for Inline Components to enable:
 * - Instance caching to avoid re-execution on every render
 * - Lifecycle hooks (onConnected, onDisconnected, etc.)
 * - Signal integration for selective re-rendering
 */

import type { IC } from "@/main";
import type { ChatoraJSXElement } from "@root/types/JSX.namespace";
import { effect, type Signal } from "@chatora/reactivity";

// Map to store IC instances by a unique key
const icInstances = new Map<string, ICInstance>();

// Stack to track the current IC context for lifecycle hooks
const icContextStack: ICInstance[] = [];

// Lifecycle callback storage
interface LifecycleCallbacks {
  connected: (() => void | Promise<void>)[];
  disconnected: (() => void | Promise<void>)[];
  attributeChanged: ((name: string, oldValue: string | null, newValue: string | null) => void | Promise<void>)[];
  adopted: (() => void | Promise<void>)[];
}

/**
 * Represents an IC instance with lifecycle management
 */
export class ICInstance {
  private ic: IC<any>;
  private props: Record<string, any>;
  private renderFunction: (() => ChatoraJSXElement) | null = null;
  private cleanupEffect: (() => void) | null = null;
  private isConnected = false;
  private callbacks: LifecycleCallbacks = {
    connected: [],
    disconnected: [],
    attributeChanged: [],
    adopted: [],
  };

  constructor(ic: IC<any>, props: Record<string, any>) {
    this.ic = ic;
    this.props = props;
  }

  /**
   * Get or create the render function with lifecycle context
   */
  getRenderFunction(): () => ChatoraJSXElement {
    if (!this.renderFunction) {
      // Set the current IC context for lifecycle hooks
      icContextStack.push(this);
      
      try {
        // Call the IC function to get the render function
        this.renderFunction = this.ic(this.props);
      } finally {
        icContextStack.pop();
      }
    }
    
    return this.renderFunction;
  }

  /**
   * Update props and potentially invalidate render function
   */
  updateProps(newProps: Record<string, any>): boolean {
    // Simple shallow comparison to check if props changed
    const propsChanged = Object.keys(newProps).some(key => 
      newProps[key] !== this.props[key]
    ) || Object.keys(this.props).some(key => 
      !(key in newProps)
    );

    if (propsChanged) {
      this.props = newProps;
      this.renderFunction = null; // Invalidate render function
      return true;
    }
    
    return false;
  }

  /**
   * Connect the instance (trigger onConnected callbacks)
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    this.isConnected = true;
    
    // Execute connected callbacks
    for (const callback of this.callbacks.connected) {
      try {
        await callback();
      } catch (error) {
        console.error("Error in IC onConnected callback:", error);
      }
    }
  }

  /**
   * Disconnect the instance (trigger onDisconnected callbacks)
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    this.isConnected = false;
    
    // Execute disconnected callbacks
    for (const callback of this.callbacks.disconnected) {
      try {
        await callback();
      } catch (error) {
        console.error("Error in IC onDisconnected callback:", error);
      }
    }

    // Cleanup effect if exists
    if (this.cleanupEffect) {
      this.cleanupEffect();
      this.cleanupEffect = null;
    }
  }

  /**
   * Trigger attribute changed callbacks
   */
  async handleAttributeChanged(name: string, oldValue: string | null, newValue: string | null): Promise<void> {
    for (const callback of this.callbacks.attributeChanged) {
      try {
        await callback(name, oldValue, newValue);
      } catch (error) {
        console.error("Error in IC onAttributeChanged callback:", error);
      }
    }
  }

  /**
   * Trigger adopted callbacks
   */
  async handleAdopted(): Promise<void> {
    for (const callback of this.callbacks.adopted) {
      try {
        await callback();
      } catch (error) {
        console.error("Error in IC onAdopted callback:", error);
      }
    }
  }

  /**
   * Add lifecycle callbacks
   */
  addConnectedCallback(callback: () => void | Promise<void>): void {
    this.callbacks.connected.push(callback);
  }

  addDisconnectedCallback(callback: () => void | Promise<void>): void {
    this.callbacks.disconnected.push(callback);
  }

  addAttributeChangedCallback(callback: (name: string, oldValue: string | null, newValue: string | null) => void | Promise<void>): void {
    this.callbacks.attributeChanged.push(callback);
  }

  addAdoptedCallback(callback: () => void | Promise<void>): void {
    this.callbacks.adopted.push(callback);
  }

  /**
   * Check if instance is connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }
}

/**
 * Generate a unique key for an IC instance based on its location and props
 */
function generateICKey(ic: IC<any>, props: Record<string, any>, context?: string): string {
  // Use function toString and props serialization for key generation
  // This is a simple approach - in production, might want more sophisticated key generation
  const icString = ic.toString();
  const propsString = JSON.stringify(props);
  const contextString = context || "";
  
  return `${icString}:${propsString}:${contextString}`;
}

/**
 * Get or create an IC instance
 */
export function getOrCreateICInstance(ic: IC<any>, props: Record<string, any>, context?: string): ICInstance {
  const key = generateICKey(ic, props, context);
  
  let instance = icInstances.get(key);
  
  if (!instance) {
    instance = new ICInstance(ic, props);
    icInstances.set(key, instance);
  } else {
    // Update props if changed
    instance.updateProps(props);
  }
  
  return instance;
}

/**
 * Remove an IC instance
 */
export function removeICInstance(ic: IC<any>, props: Record<string, any>, context?: string): void {
  const key = generateICKey(ic, props, context);
  const instance = icInstances.get(key);
  
  if (instance) {
    instance.disconnect();
    icInstances.delete(key);
  }
}

/**
 * Get the current IC instance context (for lifecycle hooks)
 */
export function getCurrentICInstance(): ICInstance | null {
  return icContextStack.length > 0 ? icContextStack[icContextStack.length - 1] : null;
}

/**
 * Lifecycle hooks for ICs - these can be called from within IC functions
 */

/**
 * Register a callback to be called when the IC is connected
 */
export function onICConnected(callback: () => void | Promise<void>): void {
  const currentInstance = getCurrentICInstance();
  if (currentInstance) {
    currentInstance.addConnectedCallback(callback);
  } else {
    // If no IC context, warn (optional - can be silenced for production)
    // console.warn("onICConnected: No IC context found. Make sure to call onICConnected during IC component definition.");
  }
}

/**
 * Register a callback to be called when the IC is disconnected
 */
export function onICDisconnected(callback: () => void | Promise<void>): void {
  const currentInstance = getCurrentICInstance();
  if (currentInstance) {
    currentInstance.addDisconnectedCallback(callback);
  } else {
    // console.warn("onICDisconnected: No IC context found. Make sure to call onICDisconnected during IC component definition.");
  }
}

/**
 * Register a callback to be called when an attribute changes
 */
export function onICAttributeChanged(callback: (name: string, oldValue: string | null, newValue: string | null) => void | Promise<void>): void {
  const currentInstance = getCurrentICInstance();
  if (currentInstance) {
    currentInstance.addAttributeChangedCallback(callback);
  } else {
    // console.warn("onICAttributeChanged: No IC context found. Make sure to call onICAttributeChanged during IC component definition.");
  }
}

/**
 * Register a callback to be called when the IC is adopted to a new document
 */
export function onICAdopted(callback: () => void | Promise<void>): void {
  const currentInstance = getCurrentICInstance();
  if (currentInstance) {
    currentInstance.addAdoptedCallback(callback);
  } else {
    // console.warn("onICAdopted: No IC context found. Make sure to call onICAdopted during IC component definition.");
  }
}

/**
 * Clear all IC instances (useful for testing or cleanup)
 */
export function clearAllICInstances(): void {
  for (const instance of icInstances.values()) {
    instance.disconnect();
  }
  icInstances.clear();
}