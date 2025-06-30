# Chatora.js

![npm](https://img.shields.io/npm/v/chatora?color=orange&logo=npm)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![License](https://img.shields.io/github/license/nucoui/chatora?color=green)
![Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18.svg?logo=vitest)

```bash
npm install chatora
```

## Description
It is a framework that allows you to implement custom elements in a React-like manner.
Usually, knowledge of classes is required, but since the implementation is function-based, this knowledge is not necessary!

## Features

- ✨ **Intuitive Web Components with JSX/TSX**<br>
  Easily create custom elements and static HTML for SSR using familiar JSX/TSX syntax.
- 🧩 **No Classes Required, Simple Function-Based Implementation**<br>
  Build custom elements with just functions—no complex class knowledge needed.
- 🔒 **Type-Safe Development**<br>
  Full TypeScript support ensures safe and reliable code.
- ⚡ **Ultra-Fast Reactivity**<br>
  Powered by a unique reactivity system based on alien-signals, delivering state management and rendering up to 2x faster than Solid.js and over 10x faster than Angular.
- 🌐 **SSR/CSR Ready**<br>
  Supports both server-side rendering and client-side rendering out of the box.
- 🔗 **Easy Integration with Major Frameworks**<br>
  Seamlessly works in SSR/CSR environments of various frameworks.

  **Supported Frameworks:**<br>
  | Framework | Status |
  | --------- | ------ |
  | React     | ✅     |
  | Next.js   | ✅     |
  | Vue.js    | ✅     |
  | Nuxt      | ✅     |
  | Svelte    | ✅     |
  | Solid.js  | 🚧     |
  | Angular   | 🚧     |
  | Lit       | 🚧     |

  ✅: Supported 🚧: Coming soon
- 🛠️ **Flexible Customization**<br>
  Utility functions, props management, and event handling are all highly customizable.
- 💡 **Lightweight & High Performance**<br>
  Minimal footprint with a focus on speed and efficiency.

# Installation

### 1. Install the package
```bash
npm install chatora
```

### 2. Setting `tsconfig.json`
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "chatora"
  }
}
```

### 3. Create a custom element
```tsx
// MiniElement.tsx
import { functionalCustomElement, signal, type CC } from "chatora";
import { Host } from "chatora/jsx-runtime";
import { toString } from "chatora/util";

type Props = {
  name?: string;
};

export type Emits = {
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

    const handleClick = () => {
      count.set((c) => c + 1);
      emits("on-click", new Event("click"));
    };

    return () => (
      <Host shadowRoot shadowRootMode="open" style={["width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;"]}>
        <h1>Hi {props().name}</h1>
        <p>Count: {count.value}</p>
        <button onClick={handleClick}>Increment</button>
        <button onClick={() => count.set((c) => c - 1)}>Decrement</button>
      </Host>
    );
  }

export const MiniElement = functionalCustomElement(Comp);
```

### 4. Use the custom element
```html
<!-- index.html -->
<mini-element name="chatora"></mini-element>

<script type="module">
  import { MiniElement } from "./MiniElement.js";
  customElements.define("mini-element", MiniElement);
</script>
```

## Packages

| Name | Description | NPM link |
| ---- | ----------- | -------- |
| chatora | Core package of the project. Users will use this package. | [chatora](https://www.npmjs.com/package/chatora) |
| @chatora/runtime | Package providing functionality to convert JSX syntax to custom element classes. Also includes implementation to make code transpiled by tsc's react-jsx reactive using packages/reactivity. | [@chatora/runtime](https://www.npmjs.com/package/@chatora/runtime) |
| @chatora/reactivity | Package to make variables used in JSX syntax reactive. Uses alien-signals, customized to provide our own implementation. | [@chatora/reactivity](https://www.npmjs.com/package/@chatora/reactivity) |
| @chatora/util | Package providing utility functions for the project. This package is used by other packages. | [@chatora/util](https://www.npmjs.com/package/@chatora/util) |
| @chatora/react | Package that provides wrapper components and functionality to make Chatora.js work with React's SSR/CSR | [@chatora/react](https://www.npmjs.com/package/@chatora/react) |
| @chatora/vue | Package that provides wrapper components and functionality to make Chatora.js work with Vue's SSR/CSR | [@chatora/vue](https://www.npmjs.com/package/@chatora/vue) |
| @chatora/svelte | Package that provides wrapper components and functionality to make Chatora.js work with Svelte's SSR/CSR | [@chatora/svelte](https://www.npmjs.com/package/@chatora/svelte) |

### Eponym
**chatora**(*/t͡ɕa toɾa/*) means tabby in Japanese