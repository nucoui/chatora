/**
 * Types allowed for ref attribute
 */
export type RefValue<T = any> = ((el: T | null) => void) | { current: T | null } | null | undefined;
