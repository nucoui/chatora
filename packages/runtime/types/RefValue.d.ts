/**
 * ref属性で許容される型
 */
export type RefValue<T = any> = ((el: T | null) => void) | { current: T | null } | null | undefined;