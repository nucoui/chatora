import { useSyncExternalStore } from "react";

// No-op subscribe function for useSyncExternalStore
const noopSubscribe = () => () => {};

/**
 * Hook to detect if we're on the client side
 * Uses React's useSyncExternalStore for proper SSR hydration
 */
export const useIsClient = () => {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
};
