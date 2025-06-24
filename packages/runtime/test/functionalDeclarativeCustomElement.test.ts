/**
 * functionalDeclarativeCustomElement のテスト
 *
 * JSX/TSXでDeclarative Shadow DOMのHTML要素を作成する関数のテストです。
 * Test for functionalDeclarativeCustomElement factory function for Declarative Shadow DOM HTML elements using JSX/TSX.
 */
import type { Element } from "hast";
import type { CC } from "../types/FunctionalCustomElement";
import { describe, expect, it } from "vitest";
import { functionalDeclarativeCustomElement } from "../src/functionalDeclarativeCustomElement";
import { Host } from "../src/jsx-runtime";

describe("functionalDeclarativeCustomElement", () => {
  it("基本的なhastオブジェクトを生成できる", () => {
    const component: CC = () => {
      return () => ({
        tag: Host,
        props: {
          shadowRoot: true,
          shadowRootMode: "open",
          children: {
            tag: "div",
            props: {},
          },
        },
      });
    };
    const result = functionalDeclarativeCustomElement(component);

    expect(result).toHaveProperty("type", "root");
    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toHaveProperty("type", "element");
    expect(result.children[0]).toHaveProperty("tagName", "template");

    const template = result.children[0] as Element;
    expect(template.properties).toHaveProperty("shadowrootmode", "open");
    expect(template.children).toHaveLength(1);

    const div = template.children[0] as Element;
    expect(div).toHaveProperty("tagName", "div");
  });

  it("shadowRootモードを指定できる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "closed",
        children: {
          tag: "div",
          props: {},
        },
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    expect(template.properties).toHaveProperty("shadowrootmode", "closed");
  });

  it("shadowRootをオフにできる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: false,
        children: {
          tag: "div",
          props: {},
        },
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    // テンプレート要素ではなく、直接コンテンツが返される
    expect(result.children[0]).toHaveProperty("tagName", "div");
  });

  it("スタイルを適用できる", () => {
    const css = "div { color: red; }";
    const component: CC = () => {
      return () => ({
        tag: Host,
        props: {
          shadowRoot: true,
          shadowRootMode: "open",
          style: [css],
          children: {
            tag: "div",
            props: {},
          },
        },
      });
    };
    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    expect(template.children).toHaveLength(2); // style要素とcontent要素

    const style = template.children[0] as Element;
    expect(style).toHaveProperty("tagName", "style");
    expect(style.children[0]).toHaveProperty("type", "text");
    expect(style.children[0]).toHaveProperty("value", css);
  });

  it("複数のスタイルを適用できる", () => {
    const css1 = "div { color: red; }";
    const css2 = "p { font-size: 16px; }";
    const component: CC = () => {
      return () => ({
        tag: Host,
        props: {
          shadowRoot: true,
          shadowRootMode: "open",
          style: [css1, css2],
          children: {
            tag: "div",
            props: {},
          },
        },
      });
    };
    const result = functionalDeclarativeCustomElement(component);
    const template = result.children[0] as Element;
    expect(template.children).toHaveLength(3); // 2つのstyle要素とcontent要素

    const style1 = template.children[0] as Element;
    const style2 = template.children[1] as Element;
    expect(style1).toHaveProperty("tagName", "style");
    expect(style2).toHaveProperty("tagName", "style");
    expect(style1.children[0]).toHaveProperty("value", css1);
    expect(style2.children[0]).toHaveProperty("value", css2);
  });

  it("複雑なJSX構造を変換できる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "open",
        children: {
          tag: "div",
          props: {
            class: "container",
            id: "main",
            children: [
              {
                tag: "h1",
                props: { children: "タイトル" },
              },
              {
                tag: "p",
                props: { class: "content", children: "これはテストです。" },
              },
              {
                tag: "button",
                props: {
                  type: "button",
                  children: "クリック",
                  // onClick イベントハンドラは削除される
                  // eslint-disable-next-line no-console
                  onClick: () => console.log("クリックされました"),
                },
              },
            ],
          },
        },
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    const div = template.children[0] as Element;

    expect(div.properties).toHaveProperty("class", "container");
    expect(div.properties).toHaveProperty("id", "main");
    expect(div.children).toHaveLength(3);

    const h1 = div.children[0] as Element;
    const p = div.children[1] as Element;
    const button = div.children[2] as Element;

    expect(h1).toHaveProperty("tagName", "h1");
    expect(h1.children[0]).toHaveProperty("value", "タイトル");

    expect(p).toHaveProperty("tagName", "p");
    expect(p.properties).toHaveProperty("class", "content");
    expect(p.children[0]).toHaveProperty("value", "これはテストです。");

    expect(button).toHaveProperty("tagName", "button");
    expect(button.properties).toHaveProperty("type", "button");
    // onClick イベントハンドラは削除されている
    expect(button.properties).not.toHaveProperty("onClick");
    expect(button.children[0]).toHaveProperty("value", "クリック");
  });

  it("配列のchildrenを処理できる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "open",
        children: {
          tag: "ul",
          props: {
            children: [
              { tag: "li", props: { children: "Item 1" } },
              { tag: "li", props: { children: "Item 2" } },
              { tag: "li", props: { children: "Item 3" } },
            ],
          },
        },
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    const ul = template.children[0] as Element;

    expect(ul).toHaveProperty("tagName", "ul");
    expect(ul.children).toHaveLength(3);

    const li1 = ul.children[0] as Element;
    const li2 = ul.children[1] as Element;
    const li3 = ul.children[2] as Element;

    expect(li1).toHaveProperty("tagName", "li");
    expect(li2).toHaveProperty("tagName", "li");
    expect(li3).toHaveProperty("tagName", "li");

    expect(li1.children[0]).toHaveProperty("value", "Item 1");
    expect(li2.children[0]).toHaveProperty("value", "Item 2");
    expect(li3.children[0]).toHaveProperty("value", "Item 3");
  });

  it("関数コンポーネントを処理できる", () => {
    const Greeting = ({ name }: { name: string }) => ({
      tag: "div",
      props: {
        children: `こんにちは、${name}さん！`,
      },
    });

    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "open",
        children: Greeting({ name: "世界" }),
      },
    });

    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    const div = template.children[0] as Element;

    expect(div).toHaveProperty("tagName", "div");
    expect(div.children[0]).toHaveProperty("value", "こんにちは、世界さん！");
  });

  it("nullやundefinedを安全に処理できる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "open",
        children: null, // または undefined
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    // 空の状態でも正常に動作する
    expect(result).toHaveProperty("type", "root");
    // 空の場合は空の配列を返す
    expect(result.children).toHaveLength(1);
  });

  it("プリミティブ値を処理できる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "open",
        children: "テキストだけ",
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    expect(template.children).toHaveLength(1);

    const textNode = template.children[0];
    expect(textNode).toHaveProperty("type", "text");
    expect(textNode).toHaveProperty("value", "テキストだけ");
  });

  it("数値を処理できる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "open",
        children: 42, // 数値を直接渡す
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    const textNode = template.children[0];

    expect(textNode).toHaveProperty("type", "text");
    expect(textNode).toHaveProperty("value", "42");
  });

  it("classNameをclassプロパティに変換できる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "open",
        children: {
          tag: "div",
          props: {
            className: "test-class",
          },
        },
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    const div = template.children[0] as Element;

    expect(div.properties).toHaveProperty("class", "test-class");
    expect(div.properties).not.toHaveProperty("className");
  });

  it("データ属性を処理できる", () => {
    const component: CC = () => () => ({
      tag: Host,
      props: {
        shadowRoot: true,
        shadowRootMode: "open",
        children: {
          tag: "div",
          props: {
            "data-test": "value",
            "data-index": 123,
          },
        },
      },
    });
    const result = functionalDeclarativeCustomElement(component);

    const template = result.children[0] as Element;
    const div = template.children[0] as Element;

    expect(div.properties).toHaveProperty("data-test", "value");
    expect(div.properties).toHaveProperty("data-index", 123);
  });

  it("definePropsが動作する", () => {
    const component: CC<{
      name: string;
      age: number;
    }> = ({ defineProps }) => {
      const props = defineProps({
        name: v => v as string,
        age: v => v as unknown as number,
      });
      return () => ({
        tag: Host,
        props: {
          shadowRoot: true,
          shadowRootMode: "open",
          children: {
            tag: "div",
            props: {
              children: `Name: ${props().name}, Age: ${props().age}`,
            },
          },
        },
      });
    };
    const result = functionalDeclarativeCustomElement(component, {});

    // SSRモードではpropsは未定義またはnullになる
    const template = result.children[0] as Element;
    const div = template.children[0] as Element;

    const text = div.children[0] as { type: string; value: string };
    expect(text).toHaveProperty("type", "text");
    expect(text.value).toMatch(/Name: (undefined|null), Age: (undefined|null)/);
  });

  it("defineEmitsがダミー関数を返す", () => {
    let emitFunction: any;
    const component: CC = ({ defineEmits }) => {
      emitFunction = defineEmits({
        "on-click": (event: any) => event,
      });
      return () => ({
        tag: Host,
        props: {
          shadowRoot: true,
          shadowRootMode: "open",
          children: {
            tag: "div",
            props: {},
          },
        },
      });
    };
    functionalDeclarativeCustomElement(component, {});

    // 関数として呼び出せること
    expect(typeof emitFunction).toBe("function");
    // 実行してもエラーが発生しないこと
    expect(() => emitFunction("on-click", { data: "test" })).not.toThrow();
  });
});
