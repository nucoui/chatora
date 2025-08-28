---
applyTo: '**'
---
# Technical Knowledge

Please understand the following knowledge. These are assumed to be known when prompts are entered.

### Directory Structure
This project is structured as a monorepo.
  - `<root>`: Project root directory
  - `<root>/config`: Project configuration files. Contains ESLint configuration.
  - `<root>/packages/**`: Source code for libraries and common modules. Source code for libraries and common modules used in applications.
    - `<root>/packages/core`: Core package of the project. Users will use this package.
    - `<root>/packages/reactivity`: Package to make variables used in JSX syntax reactive. Uses alien-signals, customized to provide our own implementation.
    - `<root>/packages/runtime`: Package providing functionality to convert JSX syntax to custom element classes. Also includes implementation to make code transpiled by tsc's react-jsx reactive using packages/reactivity.
    - `<root>/packages/util`: Package providing utility functions for the project. This package is used by other packages.
    - `<root>/packages/react`: React integration package.
    - `<root>/packages/vue`: Vue integration package.
    - `<root>/packages/svelte`: Svelte integration package.
  - `<root>/playgrounds/**`: Sample code for the project. Stores sample code that works using @chatora/core.

#### Packages Dependency Overview

This monorepo consists of several core packages with the following dependency relationships:

- **core**: Main API for users. Depends on `runtime`, `reactivity`, and `util`.
- **runtime**: Converts JSX/TSX to custom elements and SSR HTML. Depends on `reactivity` and `util`.
- **reactivity**: Provides reactive primitives (signal, effect). No internal dependencies.
- **util**: Utility functions. No internal dependencies.
- **react**: React integration. Depends on `core`, `runtime`, and `util`.
- **vue**: Vue integration. Depends on `core`, `runtime`, and `util`.
- **svelte**: Svelte integration. Depends on `core`, `runtime`, and `util`.

Dependency graph:

```
reactivity ─┬─> runtime ─┬─> core ─┬─> react
            │            │         ├─> vue
            │            │         └─> svelte
            │            └─> util
            └────────────┘
```

All packages are written in TypeScript and use pnpm for dependency management. Each package can be built/tested independently using the provided pnpm commands.
- This project uses ESLint for linting and formatting.
- This project is written in TypeScript.
- This project is tested with Vitest.
- Commands use pnpm.
- All commands can be executed from the workspace root. When you open the terminal, move to the workspace root.
  - When executing commands, always check which directory you are in before executing the command. Commands are assumed to be executed from the workspace root.
  - Ways to access commands for each project are as follows:
    - `pnpm cfg`: Executes commands for `<root>/config`.
    - `pnpm p:core`: Executes commands for `<root>/packages/core`.
    - `pnpm p:rtv`: Executes commands for `<root>/packages/reactivity`.
    - `pnpm p:rt`: Executes commands for `<root>/packages/runtime`.
    - `pnpm p:ut`: Executes commands for `<root>/packages/util`.
    - `pnpm p:react`: Executes commands for `<root>/packages/react`.
    - `pnpm p:vue`: Executes commands for `<root>/packages/vue`.
    - `pnpm p:svelte`: Executes commands for `<root>/packages/svelte`.
    - `pnpm pg:<project-name>`: Executes commands for `<root>/playgrounds/<project-name>`.

### Commands
When executing commands, be sure to go to the project root of this project before executing them.
```bash
cd <User>/<any path>/<chatora or tora> && commands ...
```

### Packages

#### `<root>/packages/core`

The `@chatora/core` package (package name: `chatora`) is the main package of the Chatora project and serves as the entry point that users actually use. This package provides functionality to generate Web Components custom element classes using JSX/TSX syntax and generate static HTML for SSR (Server-Side Rendering).

##### Dependencies and Positioning
- **External dependencies**: None (does not directly depend on other libraries)
- **Internal dependencies**: Depends on `@chatora/reactivity`, `@chatora/runtime`, and `@chatora/util` packages
- **Dependents**: Used by `@chatora/react`, `@chatora/vue`, and `@chatora/svelte` packages
- **Role**: Functions as the main entry point for the entire project, serving as an integrated interface for user-facing APIs

##### Package Structure and Export Strategy

**API Integration through re-export Pattern**
```typescript
// main.ts
export * from "@chatora/runtime";

// reactivity.ts
export * from "@chatora/reactivity";

// runtime.ts
export * from "@chatora/runtime";

// jsx-runtime.ts
export * from "@chatora/runtime/jsx-runtime";

// jsx-dev-runtime.ts
export * from "@chatora/runtime/jsx-dev-runtime";

// util.ts
export * from "@chatora/util";
```

This package provides an integrated interface that allows users to access necessary functionality from a single package by re-exporting features from other packages.

##### Package Export Configuration

**Modular Access Points**
- `.`: Main entry point (all runtime functionality)
- `./reactivity`: Dedicated export for reactivity system
- `./runtime`: Dedicated export for runtime functionality
- `./jsx-runtime`: JSX runtime implementation
- `./jsx-dev-runtime`: JSX development runtime implementation
- `./util`: Utility function collections

Each export supports both ESM/CJS formats and includes TypeScript definition files (`.d.ts`).

##### Core Features and API

**Web Components Generation**
- Generates Web Components custom element classes from components written in JSX/TSX syntax
- Implements reactive property management and lifecycle
- Automatic ShadowDOM generation and style application

**SSR Support**
- Declarative Shadow DOM generation in server environments
- Static HTML output through HAST (HTML Abstract Syntax Tree)
- Client-side hydration support

**Reactivity System**
- High-performance reactivity through `signal`, `computed`, and `effect`
- Optimized algorithms based on alien-signals
- Performance improvements through batch processing

**JSX Runtime**
- Compatibility with TypeScript's `react-jsx` transformation
- Provides `Fragment` and `Host` components
- Type-safe event handling and property management

##### Usage Examples and API Design

**Basic Usage Pattern**
```typescript
import { createCC, signal, type CC } from "chatora";
import { Host } from "chatora/jsx-runtime";
import { toString } from "chatora/util";

type Props = {
  name?: string;
};

type Emits = {
  "on-click": Event;
};

const Comp: CC<Props, Emits> = ({ defineProps, defineEmits }) => {
  const props = defineProps({
    name: v => toString(v),
  });

  const emits = defineEmits({
    "on-click": () => {},
  });

  const count = signal(0);

  return () => (
    <Host shadowRoot shadowRootMode="open">
      <h1>Hi {props().name}</h1>
      <p>Count: {count.value}</p>
      <button onClick={() => count.set(c => c + 1)}>Increment</button>
    </Host>
  );
};

export const MiniElement = createCC("mini-element", Comp);
```

##### Architectural Features

**Design as Integration Layer**
- Thin wrapper layer that integrates functionality from multiple specialized packages
- Eliminates the need for users to install multiple packages individually
- Provides consistent API experience

**Modular Import Support**
```typescript
// Full functionality access
import { signal, createCC } from "chatora";

// Direct access to specialized functionality
import { signal } from "chatora/reactivity";
import { createCC } from "chatora/runtime";
import { toString } from "chatora/util";
```

**TypeScript Type System Integration**
- Integrates type definitions from all packages
- Type-safe component definition through `CC<Props, Emits>` type
- Full compatibility with JSX.IntrinsicElements

##### Framework Integration Support

**Support for Various Frameworks**
- Integration support for React, Next.js, Vue.js, Nuxt, and Svelte
- Consistent behavior in SSR/CSR environments
- Provides foundation for framework-specific integration packages (`@chatora/react`, `@chatora/vue`, `@chatora/svelte`)

##### Build and Development Environment
- **TypeScript**: Leverages modern features with ESNext target
- **Build Tool**: ESM/CJS dual support via tsup
- **Optimization**: Optimization through minify, sourcemap, and splitting configuration
- **Output Format**: Modular output through 6 individual entry points

##### Role Within the Project
This package functions as the "face" of the Chatora project, providing the API that developers first encounter. By hiding complex internal implementations while enabling simple access to necessary functionality, it significantly improves the Web Components development experience. It also functions as the foundation for framework integration packages, maintaining consistency across the entire ecosystem.

#### `<root>/packages/reactivity`

The `@chatora/reactivity` package is designed to make variables used in JSX syntax reactive. This package is built on top of the high-performance reactivity library "alien-signals" and provides a custom API interface tailored for the Chatora project.

##### Dependencies and Positioning
- **External dependencies**: Depends on alien-signals v2.0.5
- **Internal dependencies**: None (does not depend on other packages within the project)
- **Dependents**: Used by `runtime` and `core` packages
- **Role**: Functions as the foundation of the reactivity system for the entire project

##### Core Features and API

**Signal**
```typescript
export function signal<T>(initialValue: T): Signal<T>
```
- A primitive for holding reactive values
- Access values through the `.value` property
- Update values using the `.set()` method or by passing a function
- When values change, dependent computed/effect functions automatically re-execute

**Computed**
```typescript
export function computed<T>(getter: () => T): Computed<T>
```
- Read-only values derived from other signals
- Recalculated only when dependent signals change (lazy evaluation)
- Accessed through the `.value` property

**Effect**
```typescript
export function effect(fn: (ctx: { isFirstExecution: boolean }) => void): () => void
```
- Side effect functions that execute in response to signal changes
- Receives `isFirstExecution: true` on the initial execution
- Returns a cleanup function to stop the effect

**Batch Processing**
```typescript
export function startBatch(): void
export function endBatch(): void
```
- Batches multiple signal updates for efficient processing
- Groups updates that occur between `startBatch()` and `endBatch()` calls

##### Technical Features

**High-Performance Algorithm Based on alien-signals**
- Adopts a Push-Pull reactivity system: a hybrid approach that sets dirty flags when state changes (Push) and computes values when actually needed (Pull)
- Eliminates recursive calls: designed without recursion in the core algorithm for performance improvements
- Lightweight and fast: achieves approximately 400% performance compared to Vue 3.4's reactivity system

**Chatora Project-Specific API Layer**
- Uses alien-signals' `createReactiveSystem()` to provide APIs optimized for the Chatora project
- Interface design ensuring TypeScript type safety
- API shape specialized for JSX/TSX usage

##### Build and Development Environment
- **TypeScript**: Ensures type safety with ESNext target
- **Build Tool**: Uses tsup for both ESM/CJS support
- **Testing**: Comprehensive test suite using Vitest
- **Output Format**: Both ESModule (`.js`) and CommonJS (`.cjs`) formats, including TypeScript definition files (`.d.ts`)

##### Role Within the Project
This package is used by other packages in the Chatora project (especially `runtime`) to provide reactivity to components written in JSX/TSX. It serves as a crucial foundation that provides consistent reactivity mechanisms for both Web Components state management and static HTML generation for SSR.

#### `<root>/packages/runtime`

The `@chatora/runtime` package provides functionality to convert JSX/TSX syntax to Web Components custom element classes and generate static HTML for SSR (Server-Side Rendering). This package also includes implementation to make code transpiled by TypeScript's tsc react-jsx reactive using `@chatora/reactivity`.

##### Dependencies and Positioning
- **External dependencies**: Depends on `@types/hast` (HAST type definitions)
- **Internal dependencies**: Depends on `@chatora/reactivity` package
- **Dependents**: Used by `core`, `react`, `vue`, and `svelte` packages
- **Role**: Responsible for core implementation of JSX/TSX to Web Components conversion and SSR functionality

##### Core Features and API

**JSX Runtime (jsx-runtime / jsx-dev-runtime)**
```typescript
export function jsx(tag: string | IC, props: Record<string, any> | null): ChatoraJSXElement
export const Fragment: IC<{ children: ChatoraNode }>
export { Host } from "@/components/Host"
```
- JSX runtime implementation compatible with TypeScript's `react-jsx` transformation
- `Fragment` component for flattening child elements
- `Host` component for ShadowRoot configuration

**createCC (Custom Component Creation)**
```typescript
export const createCC = <P, E>(tagName, cc, options?) => CreateCCReturn<P, E>
```
- Converts JSX/TSX written components to Web Components
- Automatically generates Declarative Shadow DOM in SSR environments
- Provides four methods: `component`, `define`, `genDSD`, and `genSD`

**genSD (Web Components Generation)**
```typescript
export function genSD<P, E>(callback: ChatoraComponent<P, E>): HTMLElement
```
- Generates Web Components custom element classes in browser environments
- Implements reactive property management and lifecycle
- Efficient updates through optimized virtual DOM (VNode) processing

**genDSD (Declarative Shadow DOM Generation)**
```typescript
export function genDSD<P, E>(callback, options?): Root
```
- Generates HAST (HTML Abstract Syntax Tree) for Declarative Shadow DOM in SSR environments
- Server-side component rendering
- HAST to JSX conversion functionality

##### Detailed genSD Implementation

**Web Components Custom Element Class Generation**
`genSD` dynamically generates Web Components custom element classes from components written in JSX/TSX. The generated classes inherit from `HTMLElement` and provide the following functionality:

**Reactive Property Management**
```typescript
props = signal<Record<string, string | undefined>>(EMPTY_OBJECT)
```
- Attribute value management using `@chatora/reactivity` signals
- Automatic attribute change detection via MutationObserver
- Efficient updates through batch processing

**defineProps Implementation**
```typescript
defineProps: (props: Record<string, (value: string | undefined) => any>) => () => any
```
- Mapping of attribute names to transformer functions
- Optimization through lazy initialization (handling pre-connected setAttribute calls)
- Type-safe attribute value conversion

**defineEmits Implementation**
```typescript
defineEmits: (events: Record<`on-${string}`, (detail: any) => void>) => emit
```
- Type-safe CustomEvent emission
- Automatic method name generation (`on-click` → `emit.click(detail)`)
- Support for bubbles, composed, and cancelable configuration

##### Lifecycle Hook Details

**onConnected**
```typescript
export const onConnected = (callback: () => void | Promise<void>) => void
```
- Registers callbacks to be executed when the component is connected to the DOM
- Must be used within custom element constructor context
- Supports multiple callback registration (managed as an array)
- Error handling that doesn't affect execution of other callbacks
- Supports asynchronous callbacks

**onDisconnected**
```typescript
export const onDisconnected = (callback: () => void | Promise<void>) => void
```
- Registers callbacks to be executed when the component is disconnected from the DOM
- Same mechanism as onConnected for managing multiple callbacks
- Used for cleanup processes and resource deallocation

**onAttributeChanged**
```typescript
export const onAttributeChanged = (callback: (name: string, oldValue: string | null, newValue: string | null) => void | Promise<void>) => void
```
- Registers callbacks to be executed when custom element attributes change
- Receives three parameters: attribute name, old value, and new value
- Achieves efficient attribute change monitoring in cooperation with MutationObserver

**onAdopted**
```typescript
export const onAdopted = (callback: () => void | Promise<void>) => void
```
- Registers callbacks to be executed when the custom element is moved to a new document
- Fires when moving elements between iframes or using document.adoptNode
- Handles relatively rare cases but provides complete Web Components specification compliance

**Custom Element Context Management**
- Safe memory usage through WeakMap-based context management
- Support for nested contexts (activeConstructorStack)
- Safe context execution via `_withCustomElementConstructorContext`

##### Architecture and Technical Features

**Efficient VNode Implementation**
- Optimization through minimal object creation
- Reduced memory usage with pre-allocated empty objects
- Type-safe VNode structure (`#text`, `#empty`, `#fragment`, `#unknown`, etc.)

**High-Performance DOM Operations**
- Namespace support (SVG, MathML) with caching functionality
- Fast path processing for event handlers
- Optimized property setting and mounting processes

**Virtual DOM Patching Optimization**
```typescript
private _patchVNode(oldVNode: VNode, newVNode: VNode, shadowRootInstance: ShadowRoot)
```
- Efficient child element patching at the fragment level
- Acceleration through index-based node search
- Optimization that skips style elements

**Reactivity Integration**
- Close cooperation with `@chatora/reactivity` package
- Attribute change monitoring via MutationObserver
- Efficient updates through batch processing

**Web Components Features**
- Custom element definition and lifecycle management
- Automatic ShadowRoot creation and style application
- Form-associated element support (`formAssociated`)

##### TypeScript Type System

**Comprehensive Type Definitions**
- `IntrinsicElements` corresponding to all HTML elements
- Type-safe event handler definitions
- Type inference support for Props and Emits

**Generics Utilization**
```typescript
type CC<P, E> = ChatoraComponent<P, E>
type ComponentProps<T> = T extends CC<infer P, any> ? P : never
type ComponentEmits<T> = T extends CC<any, infer E> ? E : never
```

##### Build and Development Environment
- **TypeScript**: Leverages modern features with ESNext target
- **Build Tool**: ESM/CJS dual support via tsup
- **Testing**: Test suite with coverage measurement using Vitest
- **Output Format**: Three entry points for main, JSX runtime, and JSX development runtime

##### Role Within the Project
This package provides the core runtime implementation of the Chatora project. It handles converting components written in JSX/TSX by users into reactive Web Components in browser environments and static HTML including Declarative Shadow DOM in SSR environments. It also functions as the foundation for framework integration packages such as React, Vue, and Svelte.

#### `<root>/packages/util`

The `@chatora/util` package provides utility functions used throughout the Chatora project. This package aims to avoid code duplication across the project by providing common type conversion, property validation, and HTML/HAST conversion functionality needed by other packages.

##### Dependencies and Positioning
- **External dependencies**: None (provides pure utility functions only)
- **Internal dependencies**: None (does not depend on other packages within the project)
- **Dependents**: Used by `core`, `runtime`, `react`, `vue`, and `svelte` packages
- **Role**: Provides utility functionality commonly used throughout the project

##### Package Structure and Export Configuration

**Modular Exports**
- `.`: All utility functionality (main entry point)
- `./propValidator`: Dedicated export for property validation functionality

**Internal Module Structure**
```typescript
// main.ts
export * from "./converter/hastToJsx";
export * from "./converter/stringToHast";
export * from "./propValidator/main";
export * from "./types/main";
```

##### Core Features and API

##### Converter (Conversion Functionality)

**stringToHast**
```typescript
export const stringToHast = (value: string): ReturnType<typeof genDSD>
```
- Converts HTML strings to HAST (HTML Abstract Syntax Tree)
- Pure JavaScript implementation without external dependencies
- Supports Declarative Shadow DOM generation in SSR environments
- Includes error handling (processes as text when parsing fails)

**Technical Features**:
- Custom HTML parser implementation (tokenize → buildAST)
- Advanced regex processing for attribute parsing
- Proper handling of self-closing tags
- Accurate parsing of nested HTML structures

**hastToJsx**
```typescript
export const hastToJsx = (hast: ReturnType<typeof stringToHast>): ChatoraJSXElement
```
- Converts HAST objects to ChatoraJSXElement
- Enables reuse of SSR-generated HAST on client-side
- Proper handling of text nodes and element nodes
- Recursive child element conversion

##### Property Validator (Property Validation)

**toString**
```typescript
const toString = (value: string | undefined): string | undefined
```
- Type-safe conversion to string
- Proper handling of undefined/empty strings

**toNumber**
```typescript
const toNumber = (value: string | undefined): number | undefined
```
- Type-safe conversion to number
- Proper validation and exclusion of NaN values
- Handling of undefined/empty strings

**toBoolean**
```typescript
const toBoolean = (value: string | undefined): boolean | undefined
```
- Type-safe conversion to boolean
- Handles special boolean value rules for HTML attributes
- `"true"`/`""`(empty string) → `true`, `"false"`/`undefined` → `false`

**toMatched**
```typescript
const toMatched = <const T extends string>(
  value: string | undefined,
  matchArray: readonly T[],
): T | undefined
```
- Validation against array values
- Type-safe implementation leveraging TypeScript type inference
- Optimal for validating enumeration-like values

##### Usage Examples and API Design

**Property Validation Usage Example**
```typescript
import { toString, toNumber, toBoolean, toMatched } from "chatora/util";

// Usage within Web Components
const props = defineProps({
  name: v => toString(v),
  count: v => toNumber(v),
  disabled: v => toBoolean(v),
  size: v => toMatched(v, ["small", "medium", "large"] as const),
});
```

**HTML/HAST Conversion Usage Example**
```typescript
import { stringToHast, hastToJsx } from "chatora/util";

// HTML string to HAST conversion in SSR environment
const hast = stringToHast("<div><p>Hello World</p></div>");

// HAST to JSX conversion on client-side
const jsx = hastToJsx(hast);
```

##### Architectural Features

**Pure Utility Design**
- Lightweight implementation without external dependencies
- Pure function collection without side effects
- High testability and maintainability

**Type Safety Focus**
- Maximizes TypeScript type inference
- Flexible type handling through generics
- Explicit handling of undefined values

**Web Components Specialization and Optimization**
- Design premised on HTML attribute string values
- Affinity with Web Components API
- Consistent behavior in both SSR/CSR environments

##### Build and Development Environment
- **TypeScript**: Leverages modern features with ESNext target
- **Build Tool**: ESM/CJS dual support via tsup
- **Testing**: Comprehensive test coverage using Vitest
- **Output Format**: 3 entry points (main, propValidator, stringToHast)

##### Role Within the Project
This package functions as the "foundation library" of the Chatora project, providing utility functionality commonly needed by all other packages. It plays a crucial role particularly in Web Components attribute value processing and HTML conversion in SSR, improving code quality and consistency throughout the project. Its design without external dependencies contributes to the overall lightweight nature and stability of the project.

#### `<root>/packages/react`

The `@chatora/react` package is an integration package that enables the use of Chatora.js Web Components in React.js environments. This package supports both SSR (Server-Side Rendering) and CSR (Client-Side Rendering), allowing seamless integration of Chatora components within React applications.

##### Dependencies and Positioning
- **External dependencies**: React v19.1.0+, react-dom v19.1.0+
- **Peer dependencies**: `chatora` (workspace package)
- **Internal dependencies**: None (does not directly depend on other project packages)
- **Role**: Integration layer enabling the use of Chatora Web Components in React.js environments

##### Package Structure and Export Configuration

**Modular Exports**
- `.`: Main entry point (all functionality)
- `./components/*`: Direct access to individual components

**Main Exports**
```typescript
export { ChatoraWrapper } from "./components/ChatoraWrapper";
export { useIsClient } from "./hooks/useIsClient";
export type { toReactEmits } from "./types/main";
export { disableError } from "./utils/disableError";
export { hastToJsx } from "./utils/hastToJsx";
export { splitProps } from "./utils/splitProps";
```

##### Core Features and API

##### ChatoraWrapper Component

**Basic API**
```typescript
type Props<P, E> = {
  props: P & E;
  tag: string;
  formAssociated?: boolean;
  component: CC<P, E>;
  children?: ReactNode;
};

export const ChatoraWrapper: <P, E>(props: Props<P, E>) => ReactElement
```

**Key Features**:
- **SSR/CSR Support**: Supports both server-side rendering and client-side hydration
- **Declarative Shadow DOM (DSD) Support**: Automatically detects and leverages DSD functionality in modern browsers
- **Automatic Custom Element Registration**: Automatic definition and management of components
- **Event Handling**: Type-safe event processing through the emits system
- **Form Associated Elements**: Support for form-associated custom elements

**Usage Example**
```typescript
import { ChatoraWrapper } from "@chatora/react";
import { MyComponent } from "./MyComponent";

<ChatoraWrapper
  tag="my-button"
  component={MyComponent}
  props={{ 
    label: "Click me",
    onClick: (event) => console.log("Clicked!", event)
  }}
  formAssociated={true}
/>
```

##### Utilities and Hooks

**useIsClient Hook**
```typescript
export const useIsClient = (): boolean
```
- React hook for client-side detection
- Ensures SSR hydration safety using `useSyncExternalStore`
- Enables proper conditional rendering in SSR/CSR environments

**splitProps Utility**
```typescript
export const splitProps = (props: Record<string, unknown>) => {
  props: Record<string, unknown>;
  emits: Record<`on${string}`, (event: Event) => void>;
}
```
- Separates React properties into props and emits
- Converts React-style event handlers (`onClick`) to Chatora format (`on-click`)
- Proper event name generation through kebab-case conversion

**hastToJsx Converter**
```typescript
export const hastToJsx = (hast: HastRoot, key?: string): ReactElement
```
- Converts HAST (HTML Abstract Syntax Tree) to React JSX elements
- Enables reuse of SSR-generated HAST on client-side
- Special handling for template tags (using `dangerouslySetInnerHTML`)
- Style element consolidation and optimization

**disableError Utility**
```typescript
export const disableError = (): void
```
- Suppresses Web Components-related hydration errors
- Filters React DOM internal errors
- Improves developer experience and reduces console noise

##### Type Definitions and TypeScript Integration

**toReactEmits Type**
```typescript
type toReactEmits<T extends Record<string, any>> = {
  [K in keyof T as K extends `on-${infer K2}` ? `on${Capitalize<K2>}` : never]: 
    (payload: CustomEvent<T[K]>) => void;
}
```
- Converts Chatora emits definitions to React-style event handler types
- Provides type-safe event handling
- Detailed type inference for custom events

##### Technical Features

**SSR/CSR Integration**
- Declarative Shadow DOM generation on server-side
- Proper hydration on client-side
- Optimization based on browser DSD support status

**Performance Optimization**
- Efficient HAST to JSX conversion
- Style element consolidation to reduce duplication
- Pre-compiled regex for high-speed error processing

**Web Components Integration**
- Dynamic custom element registration
- Proper shadow DOM handling
- Complete Form Associated Elements support

##### Build and Development Environment
- **Build Tool**: High-speed builds with Vite v5+
- **TypeScript**: Latest features with ESNext target
- **React Support**: Compatible with React v19.1.0+
- **Testing**: Comprehensive testing with Vitest + React Testing Library
- **Output Format**: ESM/CJS dual support with TypeScript definition files

##### Architectural Features

**Declarative Interface**
- React-like API design
- Type-safe component configuration through props
- Flexible content injection through children

**Hydration Safety**
- Leverages React 19's `useSyncExternalStore`
- Automatic resolution of SSR/CSR inconsistencies
- Addresses Web Components-specific hydration issues

**Error Handling**
- Automatic suppression of Web Components-related errors
- Error management that doesn't compromise developer experience
- Stability assurance in production environments

##### Role Within the Project
This package serves as a bridge between the React ecosystem and the Chatora project. It enables React developers to leverage Chatora's high-performance Web Components while maintaining their existing knowledge and workflows, providing complete compatibility with major React frameworks such as Next.js, React Router, and TanStack Start. A key feature is the balance achieved between stability in SSR environments and performance on the client-side.

#### `<root>/packages/vue`

The `@chatora/vue` package is an integration package that enables the use of Chatora.js Web Components in Vue.js environments. This package is compatible with Vue 3.5.13+ and supports both SSR (Server-Side Rendering) and CSR (Client-Side Rendering), allowing seamless integration of Chatora components within Vue applications.

##### Dependencies and Positioning
- **External dependencies**: Vue v3.5.13+
- **Peer dependencies**: `chatora` (workspace package)
- **Internal dependencies**: None (does not directly depend on other project packages)
- **Role**: Integration layer enabling the use of Chatora Web Components in Vue.js environments

##### Package Structure and Export Configuration

**Modular Exports**
- `.`: Main entry point (all functionality)
- `./components/ChatoraWrapper.vue`: Direct access to ChatoraWrapper component

**Main Exports**
```typescript
import ChatoraWrapper from "./components/ChatoraWrapper";

export { ChatoraWrapper };
export type * from "./types/events";
```

##### Core Features and API

##### ChatoraWrapper Component

**Basic API**
```typescript
export type WrapperProps<P, E> = {
  props: P & E;
  tag: string;
  component: Function;
};

export default defineComponent<WrapperProps>({
  name: "ChatoraWrapper",
  props: {
    tag: { type: String, required: true },
    props: { type: Object, required: true },
    component: { type: Function, required: true },
    shadowRoot: { type: Boolean, default: true },
    shadowRootMode: { type: String, default: "open" },
    styles: { type: Array as () => string[], default: () => [] },
  },
  // ...
})
```

**Key Features**:
- **SSR/CSR Support**: Supports both server-side rendering and client-side hydration
- **Automatic Custom Element Registration**: Automatic component definition and management within `onMounted` hook
- **Props/Emits Separation**: Automatic separation of Vue-style props and emits
- **Slot Integration**: Integration with Vue's slot system
- **Event Handling**: Event processing with `on-` prefix format

**Usage Example**
```typescript
import { ChatoraWrapper } from "@chatora/vue";
import { MyComponent } from "./MyComponent";

<ChatoraWrapper
  :tag="'my-button'"
  :component="MyComponent"
  :props="{ 
    label: 'Click me',
    'on-click': (event) => console.log('Clicked!', event)
  }"
/>
```

##### Utilities and Internal Functions

**splitProps Function**
```typescript
const splitProps = (props: Record<string, unknown>) => {
  const emits: Record<string, (event: Event) => void> = {};
  const filteredProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on-") && typeof value === "function") {
      emits[key] = value as (event: Event) => void;
    }
    else {
      filteredProps[key] = value;
    }
  }
  return { props: filteredProps, emits };
}
```
- Automatic separation of props and emits
- Event handler identification through `on-` prefix
- Integration with Vue-style event processing

**hastToJsx Conversion Function**
```typescript
export const hastToJsx = (tag: string, id: string, hast: any, children?: any, key?: string): VNode
```
- Converts HAST (HTML Abstract Syntax Tree) to Vue VNode
- Enables reuse of SSR-generated HAST on client-side
- Integration with slot system (named slot support)
- Special handling for style elements and scoping

**Style Scoping**
```typescript
const transformStyleContent = (styleContent: string, id: string): string => {
  return styleContent
    .replace(/([^{}]+)(\{[^{}]*\})/g, (_match, selector, rules) => {
      const transformedSelector = selector
        .split(",")
        .map((s: string) => `[id="${id}"] ${s.trim()}`)
        .join(", ");
      return `${transformedSelector} ${rules}`;
    });
}
```
- Automatic CSS selector scoping
- Style isolation through ID attributes
- Achieves Shadow DOM-like effects in Vue components

##### Type Definitions and TypeScript Integration

**ToVueEmits Type**
```typescript
export type ToVueEmits<T> = {
  [K in keyof T]: [T[K]]
};
```
- Converts Chatora emits definitions to Vue format types
- Tuple-format payload type definitions
- Compatibility with Vue 3's defineEmits

##### Technical Features

**Vue Composition API Integration**
- Component definition through `defineComponent`
- Lifecycle management with `onMounted` hook
- Reactive state management with `ref`
- Instance access through `getCurrentInstance`

**Slot System Integration**
- Full compatibility with Vue slots
- Named slot support
- Default slot processing
- Dynamic slot placement through slot attributes

**SSR/CSR Optimization**
- HAST generation on server-side
- Client-side hydration
- Proper rendering control through conditional branching

##### Build and Development Environment
- **Build Tool**: High-speed builds with Vite v5+
- **Vue Integration**: Vue Macros, Vue JSX plugin support
- **TypeScript**: Latest features with ESNext target
- **Output Format**: ESM/CJS dual support with TypeScript definition files
- **Optimization**: minify, sourcemap, preserveModules configuration

##### Architectural Features

**Vue 3 Design Principles Compliance**
- Modern implementation with Composition API
- Integration with reactivity system
- Leverages Vue 3's performance optimizations

**Shadow DOM Alternative Implementation**
- Style isolation in Vue environment
- Scoped CSS through ID attributes
- Special handling for template elements

**Slot-Centric Design**
- Full integration with Vue's slot system
- Flexible content placement
- Advanced layout control through named slots

##### Role Within the Project
This package serves as a bridge between the Vue ecosystem and the Chatora project. It enables Vue developers to leverage Chatora's high-performance Web Components while maintaining their existing knowledge and workflows, providing complete compatibility with major Vue frameworks such as Nuxt.js. A key feature is the integration with Vue's slot system, providing a natural development experience for Vue developers.

#### `<root>/packages/svelte`

The `@chatora/svelte` package is an integration package that enables the use of Chatora.js Web Components in SvelteJS environments. This package is compatible with Svelte v5.0.0+ and enables seamless integration of Chatora components within modern Svelte applications using SvelteKit.

##### Dependencies and Positioning
- **External dependencies**: Svelte v5.0.0+
- **Peer dependencies**: `chatora` (workspace package)
- **Internal dependencies**: None (does not directly depend on other project packages)
- **Role**: Integration layer enabling the use of Chatora Web Components in SvelteJS environments

##### Package Structure and Export Configuration

**Export Configuration**
- `.`: Main entry point (all functionality)
- TypeScript definition files: `./dist/index.d.ts`
- Svelte export: `./dist/index.js`

**Main Exports**
```typescript
import ChatoraWrapper from "$lib/ChatoraWrapper.svelte";

export { ChatoraWrapper };
```

##### Core Features and API

##### ChatoraWrapper Component

**Basic API**
```typescript
export let tag: string;
export let component: CC;
export let props: Record<string, string | undefined> = {};
```

**Key Features**:
- **CSR Support**: Supports client-side rendering
- **Automatic Custom Element Registration**: Automatic component definition and management within `onMount` hook
- **Props/Events Separation**: Automatic separation of Svelte-style props and events
- **Slot Integration**: Integration with Svelte's slot system
- **Event Handling**: Event processing with `on-` prefix format

**Usage Example**
```svelte
<script>
  import { ChatoraWrapper } from "@chatora/svelte";
  import { MyComponent } from "./MyComponent";

  const handleClick = (event) => console.log('Clicked!', event);
</script>

<ChatoraWrapper
  tag="my-button"
  component={MyComponent}
  props={{ 
    label: 'Click me',
    onClick: handleClick
  }}
>
  <slot />
</ChatoraWrapper>
```

##### Technical Implementation Details

##### Lifecycle Management
```typescript
onMount(() => {
  isClient = true;
  
  const Element = genSD(component);
  
  isDefined = customElements.get(tag) !== undefined;
  
  if (!isDefined) {
    customElements.define(tag, Element);
    isDefined = true;
  }
  
  // Props setup and event handler registration
});
```

**Client Detection**
- Client-side detection through `isClient` flag
- Custom element registration in `onMount`
- Fallback display during server-side rendering

##### Props/Events Processing
```typescript
$: if (isClient && ref) {
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && value && typeof value === "function") {
      ref!.addEventListener(`on-${key.slice(2).toLowerCase()}`, value);
    }
    else if (value !== undefined) {
      ref!.setAttribute(key, value);
    }
    else {
      ref!.removeAttribute(key);
    }
  });
}
```

**Automatic Props/Events Separation**
- Event handler identification through `on` prefix
- Automatic attribute setting and removal
- Integration with Svelte's reactive system

##### Conditional Rendering
```svelte
{#if isClient}
  <svelte:element bind:this={ref} this={tag}>
    <slot />
  </svelte:element>
{:else}
  <!-- TODO: Not implemented -->
  <svelte:element this={tag}>
    <slot />
  </svelte:element>
{/if}
```

**SSR Support**
- Full functionality on client-side
- Basic element rendering on server-side (SSR support not implemented)
- Dynamic element generation through `svelte:element`

##### Slot System Integration

**Svelte Slot Support**
- Default slot processing
- Child element placement through `<slot />`
- Dynamic content injection

##### Build and Development Environment
- **Build Tool**: High-speed builds with SvelteKit v2.16.0+
- **Svelte Integration**: Svelte v5.0.0+ support, Vite Plugin Svelte integration
- **TypeScript**: Latest features with ESNext target
- **Output Format**: ESM format with TypeScript definition files
- **Optimization**: adapter-auto, svelte-package, publint configuration

##### Architectural Features

**Svelte 5 Design Principles Compliance**
- Modern Svelte component implementation
- Integration with reactive system
- Leverages Svelte 5's performance optimizations

**Simple Integration Design**
- Minimal API surface
- Single main component (ChatoraWrapper)
- Intuitive props/events processing

**Slot-Centric Design**
- Full integration with Svelte's slot system
- Flexible content placement
- Native Svelte-like development experience

##### Limitations and Future Challenges

**SSR Support Not Implemented**
- Currently supports client-side rendering only
- Complete Declarative Shadow DOM generation on server-side not implemented
- Only basic element rendering provided

**TODO Items**
```svelte
<!-- TODO: Not implemented -->
<svelte:element this={tag}>
  <slot />
</svelte:element>
```

##### Role Within the Project
This package serves as a bridge between the Svelte ecosystem and the Chatora project. It enables Svelte developers to leverage Chatora's high-performance Web Components while maintaining their existing knowledge and workflows, providing complete compatibility with major Svelte frameworks such as SvelteKit. A distinctive feature is the integration with Svelte's slot system, providing a natural development experience for Svelte developers.
