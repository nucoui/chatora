import {
  computed as nativeComputed,
  effect as nativeEffect,
  endBatch as nativeEndBatch,
  signal as nativeSignal,
  startBatch as nativeStartBatch,
} from "@chatora/reactivity";

const signal = nativeSignal;
const computed = nativeComputed;
const effect = nativeEffect;
const startBatch = nativeStartBatch;
const endBatch = nativeEndBatch;

export {
  computed,
  effect,
  endBatch,
  signal,
  startBatch,
};
