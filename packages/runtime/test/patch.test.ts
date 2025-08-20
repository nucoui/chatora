/**
 * patch function tests
 *
 * Tests for DOM patching and diffing functionality
 */
import type { VNode } from "../src/methods/core/vNode";
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "../src/methods/genSD/mount";
import { patch } from "../src/methods/genSD/patch";

describe("patch", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should return same node for identical VNodes", () => {
    const vnode: VNode = {
      tag: "div",
      props: { id: "test" },
      children: [],
    };
    const domNode = mount(vnode);
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(vnode, vnode, parent, domNode);
    expect(result).toBe(domNode);
  });

  it("should create new node when domNode doesn't exist", () => {
    const oldVNode: VNode = { tag: "div", props: {}, children: [] };
    const newVNode: VNode = { tag: "span", props: { id: "new" }, children: [] };
    const parent = document.createElement("div");

    const result = patch(oldVNode, newVNode, parent, null as any);
    expect(result).toBeInstanceOf(HTMLElement);
    expect((result as HTMLElement).tagName).toBe("SPAN");
    expect(parent.contains(result)).toBe(true);
  });

  it("should replace node when tag changes", () => {
    const oldVNode: VNode = { tag: "div", props: {}, children: [] };
    const newVNode: VNode = { tag: "span", props: {}, children: [] };
    const domNode = mount(oldVNode);
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode);
    expect((result as HTMLElement).tagName).toBe("SPAN");
    expect(result).not.toBe(domNode);
  });

  it("should update text content", () => {
    const oldVNode: VNode = { tag: "#text", props: {}, children: ["old text"] };
    const newVNode: VNode = { tag: "#text", props: {}, children: ["new text"] };
    const domNode = document.createTextNode("old text");
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode);
    expect(result.textContent).toBe("new text");
    expect(result).toBe(domNode);
  });

  it("should replace text node with different type", () => {
    const oldVNode: VNode = { tag: "#text", props: {}, children: ["text"] };
    const newVNode: VNode = { tag: "div", props: {}, children: [] };
    const domNode = document.createTextNode("text");
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode);
    expect((result as HTMLElement).tagName).toBe("DIV");
    expect(result).not.toBe(domNode);
  });

  it("should handle empty nodes", () => {
    const oldVNode: VNode = { tag: "#empty", props: {}, children: [] };
    const newVNode: VNode = { tag: "#empty", props: {}, children: [] };
    const domNode = document.createComment("");
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode);
    expect(result).toBe(domNode);
  });

  it("should patch props efficiently", () => {
    const oldVNode: VNode = {
      tag: "div",
      props: { id: "old", class: "container", title: "old title" },
      children: [],
    };
    const newVNode: VNode = {
      tag: "div",
      props: { id: "new", class: "container", alt: "new alt" },
      children: [],
    };
    const domNode = mount(oldVNode) as HTMLElement;
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode) as HTMLElement;
    expect(result.id).toBe("new");
    expect(result.className).toBe("container");
    expect(result.hasAttribute("title")).toBe(false);
    expect(result.getAttribute("alt")).toBe("new alt");
  });

  it("should patch event handlers", () => {
    let oldClicked = false;
    let newClicked = false;

    const oldVNode: VNode = {
      tag: "button",
      props: { onclick: () => { oldClicked = true; } },
      children: [],
    };
    const newVNode: VNode = {
      tag: "button",
      props: { onclick: () => { newClicked = true; } },
      children: [],
    };

    const domNode = mount(oldVNode) as HTMLButtonElement;
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode) as HTMLButtonElement;
    result.click();

    expect(oldClicked).toBe(false);
    expect(newClicked).toBe(true);
  });

  it("should patch boolean attributes", () => {
    const oldVNode: VNode = {
      tag: "input",
      props: { disabled: true, hidden: false },
      children: [],
    };
    const newVNode: VNode = {
      tag: "input",
      props: { disabled: false, hidden: true },
      children: [],
    };

    const domNode = mount(oldVNode) as HTMLInputElement;
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode) as HTMLInputElement;
    expect(result.hasAttribute("disabled")).toBe(false);
    expect(result.hasAttribute("hidden")).toBe(true);
  });

  it("should patch children efficiently", () => {
    const oldVNode: VNode = {
      tag: "div",
      props: {},
      children: [
        "old text",
        { tag: "span", props: { id: "span1" }, children: ["span content"] },
      ],
    };
    const newVNode: VNode = {
      tag: "div",
      props: {},
      children: [
        "new text",
        { tag: "span", props: { id: "span1" }, children: ["new span content"] },
        { tag: "p", props: {}, children: ["new paragraph"] },
      ],
    };

    const domNode = mount(oldVNode) as HTMLElement;
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode) as HTMLElement;
    expect(result.childNodes[0].textContent).toBe("new text");
    expect(result.children[0].textContent).toBe("new span content");
    expect(result.children[1].tagName).toBe("P");
    expect(result.children[1].textContent).toBe("new paragraph");
  });

  it("should handle children removal", () => {
    const oldVNode: VNode = {
      tag: "div",
      props: {},
      children: [
        "text1",
        "text2",
        "text3",
      ],
    };
    const newVNode: VNode = {
      tag: "div",
      props: {},
      children: ["text1"],
    };

    const domNode = mount(oldVNode) as HTMLElement;
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode) as HTMLElement;
    expect(result.childNodes.length).toBe(1);
    expect(result.childNodes[0].textContent).toBe("text1");
  });

  it("should handle mixed string and VNode children", () => {
    const oldVNode: VNode = {
      tag: "div",
      props: {},
      children: [
        "text",
        { tag: "span", props: {}, children: ["span"] },
      ],
    };
    const newVNode: VNode = {
      tag: "div",
      props: {},
      children: [
        { tag: "p", props: {}, children: ["paragraph"] },
        "new text",
      ],
    };

    const domNode = mount(oldVNode) as HTMLElement;
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    const result = patch(oldVNode, newVNode, parent, domNode) as HTMLElement;
    expect(result.children[0].tagName).toBe("P");
    expect(result.childNodes[1].textContent).toBe("new text");
  });

  it("5階層以上のネスト要素のpatchが正しく動作し、実DOMが新しいJSXと一致すること", () => {
    // 旧VNode
    const oldVNode: VNode = {
      tag: "div",
      props: {},
      children: [
        {
          tag: "span",
          props: { class: "a" },
          children: [
            {
              tag: "div",
              props: {},
              children: [
                "1",
                {
                  tag: "span",
                  props: { class: "text" },
                  children: [
                    {
                      tag: "a",
                      props: {},
                      children: ["text"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    // 新VNode
    const newVNode: VNode = {
      tag: "div",
      props: {},
      children: [
        {
          tag: "span",
          props: { class: "a" },
          children: [
            {
              tag: "div",
              props: {},
              children: [
                "1",
                {
                  tag: "span",
                  props: { class: "text" },
                  children: [
                    "2",
                    {
                      tag: "a",
                      props: {},
                      children: ["text"],
                    },
                    {
                      tag: "span",
                      props: { class: "add" },
                      children: ["span"],
                    },
                    "2",
                  ],
                },
                "1",
              ],
            },
            "0",
          ],
        },
      ],
    };

    // DOMのセットアップ
    const domNode = mount(oldVNode) as HTMLElement;
    const parent = document.createElement("div");
    parent.appendChild(domNode);

    // patch実行
    const result = patch(oldVNode, newVNode, parent, domNode) as HTMLElement;

    // DOM構造の検証
    // <div>
    //   <span class="a">
    //     <div>
    //       1
    //       <span class="text">
    //         2
    //         <a>text</a>
    //         <span class="add">span</span>
    //         2
    //       </span>
    //       1
    //     </div>
    //     0
    //   </span>
    // </div>
    expect(result.tagName).toBe("DIV");
    const spanA = result.firstElementChild as HTMLElement;
    expect(spanA.tagName).toBe("SPAN");
    expect(spanA.className).toBe("a");

    const div = spanA.firstElementChild as HTMLElement;
    expect(div.tagName).toBe("DIV");

    // divの子ノード: ["1", <span class="text">...</span>, "1"]
    expect(div.childNodes.length).toBe(3);
    expect(div.childNodes[0].textContent).toBe("1");
    const spanText = div.childNodes[1] as HTMLElement;
    expect(spanText.nodeType).toBe(Node.ELEMENT_NODE);
    expect((spanText as HTMLElement).tagName).toBe("SPAN");
    expect((spanText as HTMLElement).className).toBe("text");

    // span.textの子ノード: ["2", <a>text</a>, <span class="add">span</span>, "2"]
    expect(spanText.childNodes.length).toBe(4);
    expect(spanText.childNodes[0].textContent).toBe("2");
    const a = spanText.childNodes[1] as HTMLElement;
    expect(a.tagName).toBe("A");
    expect(a.textContent).toBe("text");
    const spanAdd = spanText.childNodes[2] as HTMLElement;
    expect(spanAdd.tagName).toBe("SPAN");
    expect(spanAdd.className).toBe("add");
    expect(spanAdd.textContent).toBe("span");
    expect(spanText.childNodes[3].textContent).toBe("2");

    // div.childNodes[2] = "1"
    expect(div.childNodes[2].textContent).toBe("1");

    // spanA.childNodes[1] = "0"
    expect(spanA.childNodes[1].textContent).toBe("0");
  });
});
