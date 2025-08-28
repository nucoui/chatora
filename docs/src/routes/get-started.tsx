import { Breadcrumb } from "@nuco/react/components/Breadcrumb";
import { CodeBlock } from "@nuco/react/components/CodeBlock";
import { H1 } from "@nuco/react/components/H1";
import { H3 } from "@nuco/react/components/H3";
import { Li } from "@nuco/react/components/Li";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./get-started.module.scss";

export const Route = createFileRoute("/get-started")({
  component: RouteComponent,
});

const TS_CONFIG_JSON = `{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "chatora"
  }
}
`;

const EXAMPLE_CUSTOM_ELEMENT = `import { createCC, signal, type CC } from "chatora";
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

export const MiniElement = createCC("mini-element", Comp);`;

function RouteComponent() {
  return (
    <main className={styles["main-content"]}>
      <Breadcrumb>
        <Li><a href="/">Home</a></Li>
        <Li><a href="/get-started">Get Started</a></Li>
      </Breadcrumb>
      <div style={{ maxWidth: "1200px" }}>
        <H1>Get Started</H1>
        <H3>1. Install</H3>
        <CodeBlock lang="bash" fileName="install.sh" code="npm install chatora" />
        <H3>2. Setting tsconfig.json</H3>
        <CodeBlock lang="json" fileName="tsconfig.json" code={TS_CONFIG_JSON} />
        <H3>3. Create a custom element</H3>
        <CodeBlock lang="tsx" fileName="MiniElement.tsx" code={EXAMPLE_CUSTOM_ELEMENT} />
      </div>
    </main>
  );
}
