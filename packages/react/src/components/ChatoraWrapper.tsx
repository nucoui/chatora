"use client";

import type { CC } from "chatora";
import type { ReactNode } from "react";
import { hastToJsx } from "@/main";
import { disableError } from "@/utils/disableError";
import { splitProps } from "@/utils/splitProps";
import { functionalCustomElement, functionalDeclarativeCustomElement } from "chatora";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { jsx } from "react/jsx-runtime";

disableError();

// Constants for browser and DSD support detection
const isServer = typeof document === "undefined";
const supportsDSD = !isServer && "shadowRootMode" in HTMLTemplateElement.prototype;

// No-op subscribe function for useSyncExternalStore
const noopSubscribe = () => () => {};

/**
 * Hook to detect if we're on the client side
 * Uses React's useSyncExternalStore for proper SSR hydration
 */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export type Props<P extends Record<string, unknown>, E extends Record<string, unknown>> = {
  props: P & E;
  tag: string;
  formAssociated?: boolean;
  component: CC<P, E>;
  children?: ReactNode;
};

/**
 * ChatoraWrapper component for rendering Chatora components in React applications
 *
 * Features:
 * - Supports both server-side rendering (SSR) and client-side hydration
 * - Improved SSR/CSR handling with better client detection
 * - Automatic custom element registration and management
 * - Event handling through the emits system
 * - Form association support for form-associated custom elements
 * - Declarative Shadow DOM awareness for modern browsers
 *
 * @example
 * // Basic usage
 * <ChatoraWrapper
 *   tag="my-button"
 *   component={ButtonComponent}
 *   props={{ label: "Click me" }}
 * />
 *
 * @example
 * // Form-associated custom element
 * <ChatoraWrapper
 *   tag="my-input"
 *   component={InputComponent}
 *   props={{ value: "initial" }}
 *   formAssociated={true}
 * />
 */
export const ChatoraWrapper = <P extends Record<string, unknown>, E extends Record<string, unknown>>({
  tag,
  component,
  children,
  props,
  formAssociated = false,
}: Props<P, E>) => {
  const isClient = useIsClient();

  const id = useId();
  const { props: filteredProps, emits } = useMemo(() => splitProps(props || {}), [props]);
  const hast = functionalDeclarativeCustomElement<P>(
    component as CC<P, never>,
    {
      props: filteredProps as P,
    },
  );
  const [content, setContent] = useState<ReactNode>([hastToJsx(hast, `${id}-content`), children]);
  const domRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setContent(children);
  }, [children]);

  useLayoutEffect(() => {
    if (!customElements || customElements.get(tag)) {
      return;
    }

    class element extends functionalCustomElement(component) {
      static formAssociated = formAssociated;
    };

    customElements.define(tag, element);
  }, [component, formAssociated, tag]);

  // Improved SSR/CSR handling with DSD support
  if (isClient) {
    return jsx(tag as any, {
      ref: domRef,
      ...filteredProps,
      ...emits,
      children: content,
    }, `${id}-hydration`);
  }

  // Server-side rendering with potential DSD support
  // Let Chatora handle shadow DOM via functionalDeclarativeCustomElement,
  // but enhance with DSD awareness
  if (supportsDSD) {
    // When DSD is supported, the content from functionalDeclarativeCustomElement
    // might already contain the proper template structure
    return jsx(tag as any, {
      ...filteredProps,
      children: content,
    }, `${id}-dsd-ssr`);
  }

  // Fallback SSR without DSD support
  return jsx(tag as any, {
    ...filteredProps,
    children: content,
  }, `${id}-ssr`);
};
