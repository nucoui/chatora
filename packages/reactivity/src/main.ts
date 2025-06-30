/**
 * Re-exports the core reactivity functions from alien-signals with custom wrappers
 * to match the expected interface for the Chatora project.
 * @module @chatora/reactivity
 */

import {
  createReactiveSystem,
  ReactiveFlags,
} from "alien-signals/system";

/**
 * Represents a reactive value that can be accessed with .value property
 */
export interface ReactiveValue<T> {
  value: T;
}

/**
 * Represents a signal that has both .value property and .set() method
 */
export interface Signal<T> extends ReactiveValue<T> {
  set: (newValue: T | ((prev: T) => T)) => void;
  run: () => T;
}

/**
 * Represents a computed function type
 */
export type Computed<T> = ReactiveValue<T>;

/**
 * Represents an effect function type
 */
export type Effect = () => void;

// --- Core system instance ---
const {
  link,
  unlink,
  propagate,
  checkDirty,
  endTracking,
  startTracking,
  shallowPropagate,
} = createReactiveSystem({
  update(node: any): boolean {
    if ("getter" in node) {
      return updateComputed(node);
    }
    else {
      return updateSignal(node, node.value);
    }
  },
  notify,
  unwatched(node: any) {
    if ("getter" in node) {
      let toRemove = node.deps;
      if (toRemove !== undefined) {
        node.flags = (ReactiveFlags.Mutable | ReactiveFlags.Dirty) as number;
        do {
          toRemove = unlink(toRemove, node);
        } while (toRemove !== undefined);
      }
    }
    else if (!("previousValue" in node)) {
      effectOper.call(node);
    }
  },
});

const EFFECT_FLAG_QUEUED = 1 << 6;

let batchDepth = 0;
let notifyIndex = 0;
let queuedEffectsLength = 0;
const queuedEffects: (any | undefined)[] = [];
let activeSub: any;
let activeScope: any;

function setCurrentSub(sub: any) {
  const prevSub = activeSub;
  activeSub = sub;
  return prevSub;
}

export function startBatch(): void {
  ++batchDepth;
}

export function endBatch(): void {
  if (!--batchDepth) {
    flush();
  }
}

function flush(): void {
  while (notifyIndex < queuedEffectsLength) {
    const effect = queuedEffects[notifyIndex]!;
    queuedEffects[notifyIndex++] = undefined;
    run(effect, (effect.flags &= ~EFFECT_FLAG_QUEUED));
  }
  notifyIndex = 0;
  queuedEffectsLength = 0;
}

// --- Chatora API ---

/**
 * Creates a reactive signal with the given initial value.
 * Returns a signal object that has both .value property and .set() method.
 */
export function signal<T>(initialValue: T): Signal<T> {
  const node = {
    previousValue: initialValue,
    value: initialValue,
    subs: undefined,
    subsTail: undefined,
    flags: ReactiveFlags.Mutable as number,
  };

  // getter
  const get = () => {
    if (node.flags & ReactiveFlags.Dirty) {
      if (updateSignal(node, node.value)) {
        const subs = node.subs;
        if (subs !== undefined) {
          shallowPropagate(subs);
        }
      }
    }

    if (activeSub !== undefined) {
      link(node, activeSub);
    }
    else if (activeScope !== undefined) {
      link(node, activeScope);
    }
    return node.value;
  };

  // setter
  const set = (newValue: T | ((prev: T) => T)) => {
    const next = typeof newValue === "function"
      ? (newValue as (prev: T) => T)(node.value)
      : newValue;
    const changed = node.value !== next;
    node.value = next;
    if (changed) {
      node.flags = (ReactiveFlags.Mutable | ReactiveFlags.Dirty) as number;
      const subs = node.subs;
      if (subs !== undefined) {
        propagate(subs);
        if (!batchDepth) {
          flush();
        }
      }
    }
  };

  // Create a signal object with both .value and .set()
  const signal: Signal<T> = {
    get value() {
      return get();
    },
    set,
    run: () => {
      return get();
    },
  };

  return signal;
}

/**
 * Creates a computed signal that derives its value from other signals.
 */
export function computed<T>(getter: () => T): Computed<T> {
  const node = {
    value: undefined as T | undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: (ReactiveFlags.Mutable | ReactiveFlags.Dirty) as number,
    getter: getter as (previousValue?: unknown) => unknown,
  };

  const get = () => {
    const flags = node.flags;
    if (
      flags & ReactiveFlags.Dirty
      || (flags & ReactiveFlags.Pending && checkDirty(node.deps!, node))
    ) {
      if (updateComputed(node)) {
        const subs = node.subs;
        if (subs !== undefined) {
          shallowPropagate(subs);
        }
      }
    }
    else if (flags & ReactiveFlags.Pending) {
      node.flags = flags & ~ReactiveFlags.Pending;
    }

    if (activeSub !== undefined) {
      link(node, activeSub);
    }
    else if (activeScope !== undefined) {
      link(node, activeScope);
    }
    return node.value!;
  };

  // Create a reactive value that supports both function call and .value access
  return createReactiveValue(get);
}

/**
 * Creates an effect that runs when its dependencies change.
 * @param fn - The effect function to execute. Receives { isFirstExecution }.
 * @returns A function that can be called to clean up the effect.
 */
export function effect(
  fn: (ctx: { isFirstExecution: boolean }) => void,
): () => void {
  const node = {
    fn,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: ReactiveFlags.Watching as number,
  };

  if (activeSub !== undefined) {
    link(node, activeSub);
  }
  else if (activeScope !== undefined) {
    link(node, activeScope);
  }

  // 初回は依存トラッキング用として isFirstExecution: true で呼ぶ
  const prev = setCurrentSub(node);
  try {
    startTracking(node);
    fn({ isFirstExecution: true });
    endTracking(node);
  }
  finally {
    setCurrentSub(prev);
  }
  return effectOper.bind(node);
}

// --- helpers ---

/**
 * Creates a reactive value that can be accessed with .value property
 */
function createReactiveValue<T>(getter: () => T): ReactiveValue<T> {
  // Create an object with .value property that calls getter
  const reactiveValue: ReactiveValue<T> = {
    get value() {
      return getter();
    },
  };

  return reactiveValue;
}

function updateComputed(node: any): boolean {
  const prevSub = setCurrentSub(node);
  startTracking(node);
  try {
    const oldValue = node.value;
    return oldValue !== (node.value = node.getter(oldValue));
  }
  finally {
    setCurrentSub(prevSub);
    endTracking(node);
  }
}

function updateSignal(node: any, value: any): boolean {
  node.flags = ReactiveFlags.Mutable as number;
  return node.previousValue !== (node.previousValue = value);
}

function notify(e: any) {
  const flags = e.flags;
  if (!(flags & EFFECT_FLAG_QUEUED)) {
    e.flags = flags | EFFECT_FLAG_QUEUED;
    const subs = e.subs;
    if (subs !== undefined) {
      notify(subs.sub);
    }
    else {
      queuedEffects[queuedEffectsLength++] = e;
    }
  }
}

function run(e: any, flags: number): void {
  if (
    flags & ReactiveFlags.Dirty
    || (flags & ReactiveFlags.Pending && checkDirty(e.deps!, e))
  ) {
    const prev = setCurrentSub(e);
    startTracking(e);
    try {
      e.fn({ isFirstExecution: false });
    }
    finally {
      setCurrentSub(prev);
      endTracking(e);
    }
    return;
  }
  else if (flags & ReactiveFlags.Pending) {
    e.flags = flags & ~EFFECT_FLAG_QUEUED;
  }

  let linkNode = e.deps;
  while (linkNode !== undefined) {
    const dep = linkNode.dep;
    const depFlags = dep.flags;
    if (depFlags & EFFECT_FLAG_QUEUED) {
      run(dep, (dep.flags = depFlags & ~EFFECT_FLAG_QUEUED));
    }
    linkNode = linkNode.nextDep;
  }
}

function effectOper(this: any): void {
  let dep = this.deps;
  while (dep !== undefined) {
    dep = unlink(dep, this);
  }
  const sub = this.subs;
  if (sub !== undefined) {
    unlink(sub);
  }
  this.flags = ReactiveFlags.None as number;
}
