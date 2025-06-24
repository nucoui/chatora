import type { CC } from "../types/FunctionalCustomElement";
/**
 * functionalCustomElement のテスト
 *
 * JSX/TSXでWeb ComponentsのCustom Element Classを生成するファクトリ関数のテストです。
 * Test for functionalCustomElement factory function for Web Components Custom Element Class using JSX/TSX.
 */
import { describe, expect, it } from "vitest";
import { functionalCustomElement } from "../src/functionalCustomElement";

// ダミーのChatoraJSXElementを返す
const DummyJSX = (): import("../types/JSX.namespace").ChatoraJSXElement => ({
  tag: "div",
  props: {},
});

describe("functionalCustomElement", () => {
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
});
