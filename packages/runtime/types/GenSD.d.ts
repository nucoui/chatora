// @ts-check

/**
 * Type definition file for genSD
 *
 * Factory function for creating Web Components Custom Element Class using JSX/TSX.
 *
 * @param callback - Callback to register lifecycle hooks and render function
 * @param options - Options for ShadowRoot and form association
 * @returns CustomElement class
 */

import type { IC } from "./InlineComponent";
import type { ChatoraNode } from "./JSX.namespace";

type UnionKeys<T> = T extends T ? keyof T : never;

export type AsFunctionType<T> = [T] extends [object]
  ? { [K in UnionKeys<T>]: (v: string | undefined) => T[K]; }
  : never;

// CCの短縮型を定義
export type CC<
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<never, never>,
> = ChatoraComponent<P, E>;

export type ChatoraComponent<P extends Record<string, any> = Record<string, never>, E extends Record<`on-${string}`, any> = Record<`on-${string}`, never>> = (params: {
  /**
   * Define the props
   *
   * @example
   *   // Use transformer functions
   *   const props = defineProps({
   *     disabled: toBoolean,
   *     value: (v) => v
   *   })
   *   // props(): { disabled: boolean | undefined, value: string | undefined }
   */
  defineProps: <const T extends AsFunctionType<P>>(props: T) => () => {
    [K in keyof T]: undefined extends ReturnType<T[K]>
      ? P[K]
      : Required<P[K]>
  };
  /**
   * Define the emits
   *
   * @example
   *   // Type-safe event definition
   *   const emits = defineEmits({
   *     "on-click": (detail: { count: number }) => {},
   *     "on-change": (detail: string) => {}
   *   })
   *   emits("on-click", { count: 1 }) // Type-safe CustomEvent emission
   */
  defineEmits: <T extends { [K in keyof E]: (detail: E[K]) => void }>(events: T) => <K extends keyof E>(type: K, detail?: E[K], options?: EventInit) => void;
}) => () => ChatoraNode | ChatoraNode[];

export type GenSD = <
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<`on-${string}`, never>,
>(
  component: ChatoraComponent<P, E>,
) => {
  new (): HTMLElement;
};

/**
 * Extracts the Props type from a CC<Props, Emits> component.
 * @template T - The component type.
 */
export type ComponentProps<T> = T extends CC<infer P, any> ? P : T extends IC<infer P> ? P : never;

/**
 * Extracts the Emits type from a CC<Props, Emits> component.
 * @template T - The component type.
 */
export type ComponentEmits<T> = T extends CC<any, infer E> ? E : never;
