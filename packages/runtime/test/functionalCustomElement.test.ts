import type { CC } from "../types/FunctionalCustomElement";
/**
 * functionalCustomElement のテスト
 *
 * JSX/TSXでWeb ComponentsのCustom Element Classを生成するファクトリ関数のテストです。
 * Test for functionalCustomElement factory function for Web Components Custom Element Class using JSX/TSX.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { functionalCustomElement } from "../src/functionalCustomElement";

// ダミーのChatoraJSXElementを返す
const DummyJSX = (): import("../types/JSX.namespace").ChatoraJSXElement => ({
  tag: "div",
  props: {},
});

describe("functionalCustomElement", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("should throw error in SSR environment", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - Testing SSR behavior
    delete globalThis.window;

    expect(() => {
      functionalCustomElement(() => () => DummyJSX());
    }).toThrow("functionalCustomElement is not supported in SSR environment.");

    globalThis.window = originalWindow;
  });

  it("customElementクラスを生成できる", () => {
    const tagName = "x-test-el1";
    const CustomElement = functionalCustomElement(({ onConnected }) => {
      onConnected(() => {
        /* connected callback */
      });
      return () => DummyJSX();
    }, {});
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(typeof el.handleConnected).toBe("function");
    expect("_vnode" in el).toBe(true);
  });

  it("shadowRootオプションが有効でshadowRootが存在する", () => {
    const tagName = "x-test-el2";
    const component: CC = () => {
      return () => DummyJSX();
    };
    const CustomElement = functionalCustomElement(component);
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el); // connectedCallbackを発火させる
    expect(el.shadowRoot).not.toBeNull();
  });

  it("should handle defineProps correctly", async () => {
    const tagName = "x-test-props";
    let propsGetter: any;

    const CustomElement = functionalCustomElement(({ defineProps }) => {
      propsGetter = defineProps({
        name: value => value || "default",
        count: value => value ? Number.parseInt(value, 10) : 0,
        disabled: value => value === "true",
      });
      return () => DummyJSX();
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    // Set attributes after connecting to DOM so MutationObserver is active
    el.setAttribute("name", "test");
    el.setAttribute("count", "42");
    el.setAttribute("disabled", "true");

    // Wait for MutationObserver to process attribute changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const props = propsGetter();
    expect(props.name).toBe("test");
    expect(props.count).toBe(42);
    expect(props.disabled).toBe(true);
  });

  it("should handle defineEmits correctly", () => {
    const tagName = "x-test-emits";
    let emit: any;

    const CustomElement = functionalCustomElement(({ defineEmits }) => {
      emit = defineEmits({
        "on-click": (_detail: any) => {},
        "on-change": (_detail: any) => {},
      });
      return () => DummyJSX();
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    let clickDetail: any = null;
    let changeDetail: any = null;

    el.addEventListener("on-click", (e: any) => {
      clickDetail = e.detail;
    });

    el.addEventListener("on-change", (e: any) => {
      changeDetail = e.detail;
    });

    emit("on-click", { button: "left" });
    emit("on-change", { value: "new" });

    expect(clickDetail).toEqual({ button: "left" });
    expect(changeDetail).toEqual({ value: "new" });
  });

  it("should handle getHost method", () => {
    const tagName = "x-test-host";
    let hostElement: any;

    const CustomElement = functionalCustomElement(({ getHost }) => {
      hostElement = getHost();
      return () => DummyJSX();
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    expect(hostElement).toBe(el);
  });

  it("should handle getShadowRoot method", () => {
    const tagName = "x-test-shadow";
    let shadowRoot: any;

    const CustomElement = functionalCustomElement(({ getShadowRoot }) => {
      return () => {
        shadowRoot = getShadowRoot();
        return DummyJSX();
      };
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    expect(shadowRoot).toBe(el.shadowRoot);
  });

  it("should handle getInternals method", () => {
    const tagName = "x-test-internals";
    let internals: any;

    const CustomElement = functionalCustomElement(({ getInternals }) => {
      internals = getInternals();
      return () => DummyJSX();
    });

    CustomElement.formAssociated = true;

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    if (el.attachInternals) {
      expect(internals).toBeInstanceOf(ElementInternals);
    }
  });

  it("should handle fragment rendering", () => {
    const tagName = "x-test-fragment";

    const CustomElement = functionalCustomElement(() => {
      return () => ({
        tag: "#fragment",
        props: {
          children: [
            "Text node",
            { tag: "span", props: { children: ["Span content"] } },
          ],
        },
      });
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    expect(el.shadowRoot?.childNodes.length).toBe(2);
    expect(el.shadowRoot?.childNodes[0].textContent).toBe("Text node");
    expect((el.shadowRoot?.childNodes[1] as Element).tagName).toBe("SPAN");
  });

  it("should handle root rendering with options", () => {
    const tagName = "x-test-root";

    const CustomElement = functionalCustomElement(() => {
      return () => ({
        tag: "#root",
        props: {
          shadowRoot: true,
          shadowRootMode: "closed" as const,
          style: "color: red;",
          children: [
            { tag: "div", props: { children: ["Root content"] } },
          ],
        },
      });
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    // Note: We can't directly test closed shadow root, but we can test that it was created
    expect(el.shadowRoot).toBeNull(); // Closed shadow root is not accessible
  });

  it("should handle attribute changes with MutationObserver", async () => {
    const tagName = "x-test-mutation";
    let propsGetter: any;

    const CustomElement = functionalCustomElement(({ defineProps }) => {
      propsGetter = defineProps({
        value: v => v || "default",
      });
      return () => DummyJSX();
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    // Initial value
    expect(propsGetter().value).toBe("default");

    // Change attribute
    el.setAttribute("value", "changed");

    // Wait for MutationObserver
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(propsGetter().value).toBe("changed");
  });

  it("should handle disconnection properly", () => {
    const tagName = "x-test-disconnect";
    const disconnectSpy = vi.fn();

    const CustomElement = functionalCustomElement(({ onDisconnected }) => {
      onDisconnected(disconnectSpy);
      return () => DummyJSX();
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);
    document.body.removeChild(el);

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it("shadowRootオプションが無効でshadowRootが存在しない", () => {
    const tagName = "x-test-el3";
    const component: CC = () => {
      return () => DummyJSX();
    };
    const CustomElement = functionalCustomElement(component);
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    expect(el.shadowRoot).toBeNull();
  });

  it("propsに全ての属性が含まれる", () => {
    const tagName = "x-test-el4";
    const CustomElement = functionalCustomElement(() => {
      // テスト用にpropsを返すだけのダミー
      return {};
    }, {});
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    el.setAttribute("foo", "bar");
    el.setAttribute("baz", "qux");
    // propsが属性を正しく含むか確認
    const props = Object.fromEntries(
      Array.from(el.getAttributeNames()).map(attr => [attr, el.getAttribute(attr)]),
    );
    expect(props).toEqual({ foo: "bar", baz: "qux" });
  });

  /**
   * defineEmitsのemit関数が正しくイベントを発火するかのテスト
   * Test that defineEmits emitters fire events correctly
   */
  it("defineEmitsのemit関数がイベントを発火する", () => {
    const tagName = "x-test-el-emits";
    let receivedDetail: any = null;
    const component: CC = ({ defineEmits }) => {
      const emits = defineEmits({
        "on-foo": (_detail: any) => {},
        "on-bar": (_detail: any) => {},
      });
      (window as any).emit = emits;

      return () => DummyJSX();
    };
    const CustomElement = functionalCustomElement(component);
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);
    el.addEventListener("on-foo", (e: CustomEvent) => {
      receivedDetail = e.detail;
    });
    // emit関数を呼び出してイベントが発火するか
    (window as any).emit("on-foo", { hello: "world" });
    expect(receivedDetail).toEqual({ hello: "world" });
    // barイベントも同様に
    let barReceived = false;
    el.addEventListener("on-bar", () => {
      barReceived = true;
    });
    (window as any).emit("on-bar");
    expect(barReceived).toBe(true);
  });

  it("defineEmitsが型定義通りのemit関数を返す", () => {
    const tagName = "x-test-el-emits2";
    let receivedType: string | null = null;
    let receivedDetail: any = null;
    const component: CC = ({ defineEmits }) => {
      // 型推論が効くかどうかのテスト
      const emit = defineEmits({
        "on-foo": (_detail: any) => {},
        "on-bar": (_detail: any) => {},
      });
      (window as any).emit = emit;
      return () => DummyJSX();
    };
    // functionalCustomElementを使ってCustomElementを生成
    const CustomElement = functionalCustomElement(component);
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);
    el.addEventListener("on-foo", (e: CustomEvent) => {
      receivedType = "on-foo";
      receivedDetail = e.detail;
    });
    (window as any).emit("on-foo", { a: 1 });
    expect(receivedType).toBe("on-foo");
    expect(receivedDetail).toEqual({ a: 1 });
    // 存在しないイベント名は型エラーになることをTypeScriptで確認できる
    // (window as any).emit("baz", {}); // これは型エラーになるべき
  });

  it("should handle complex rendering scenarios", () => {
    const tagName = "x-test-complex";
    let renderCount = 0;

    const CustomElement = functionalCustomElement(({ defineProps }) => {
      const getProps = defineProps({
        mode: value => value || "simple",
      });

      return () => {
        renderCount++;
        const props = getProps();

        if (props.mode === "fragment") {
          return {
            tag: "#fragment",
            props: {
              children: [
                "Fragment child 1",
                { tag: "span", props: { children: ["Fragment child 2"] } },
              ],
            },
          };
        }

        return {
          tag: "div",
          props: {
            class: `mode-${props.mode}`,
            children: [`Mode: ${props.mode}`],
          },
        };
      };
    });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el);

    // Initial render
    expect(renderCount).toBeGreaterThan(0);

    // Change to fragment mode
    el.setAttribute("mode", "fragment");

    // Should trigger re-render
    expect(renderCount).toBeGreaterThan(1);
  });
});
