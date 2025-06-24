import type { VNode } from "@/functionalCustomElement/vNode";
import type { FunctionalCustomElement } from "@root/types/FunctionalCustomElement";
import { mount } from "@/functionalCustomElement/mount";
import { onAdopted, onAttributeChangedBase, onConnectedBase, onDisconnectedBase } from "@/functionalCustomElement/on";
import { patch } from "@/functionalCustomElement/patch";
import { applyStyles } from "@/functionalCustomElement/style";
import { genVNode } from "@/functionalCustomElement/vNode";
import { computed, effect, endBatch, signal, startBatch } from "@chatora/reactivity";

/**
 * FunctionalCustomElementの型引数を関数使用時に指定できるようにします。
 * Allow generics to be specified at function usage.
 */
const functionalCustomElement: FunctionalCustomElement = (
  callback,
) => {
  if (typeof window === "undefined") {
    throw new TypeError("functionalCustomElement is not supported in SSR environment.");
  }

  return class extends HTMLElement {
    static formAssociated: boolean = false;
    /**
     * MutationObserverインスタンス
     * MutationObserver instance for attribute changes
     *
     * TypeScriptの制約により、エクスポートされるクラスのprivate/protectedプロパティは型エラーとなるためpublicにします。
     */
    _attributeObserver: MutationObserver;
    /**
     * 監視対象属性リスト
     * List of observed attributes
     */
    observedAttributes: readonly string[] = [];

    /**
     * 属性値を保持するリアクティブなprops
     * Reactive props holding attribute values
     */
    props = signal<Record<string, string | undefined>>({});

    _vnode: VNode | null = null;

    /**
     * 最後に登録されたrenderコールバックを保持します。
     * Stores the latest render callback for attribute-triggered re-rendering.
     */
    _renderCallback?: () => void;

    /**
     * effect/renderの初回登録済みフラグ
     * Prevent multiple effect registrations
     */
    _effectInitialized = false;

    #shadowRoot?: boolean = true;
    #shadowRootMode?: ShadowRootMode = "open";
    #style?: string | string[] = [];

    constructor() {
      super();

      const render = callback({
        reactivity: {
          signal,
          effect,
          computed,
          startBatch,
          endBatch,
        },
        /**
         * 属性変換関数オブジェクトを受け取り、属性値を取得するgetter関数を返します。
         * Accepts an object of attribute transformer functions and returns a getter function for attribute values.
         * @param props - 属性変換関数オブジェクト (Object of attribute transformer functions)
         * @returns 属性値を取得するgetter関数 (Getter function for attribute values)
         */
        defineProps: (props: Record<string, (value: string | undefined) => any>) => {
          this.observedAttributes = Object.keys(props);

          // 初期値を設定
          const initialProps: Record<string, string | undefined> = {};
          for (const name of this.observedAttributes) {
            initialProps[name] = this.getAttribute(name) || undefined;
          }
          this.props[1](initialProps);

          // getter関数を返す
          return () => {
            const rawProps = this.props[0]();
            const transformedProps: Record<string, any> = {};
            for (const [key, transformer] of Object.entries(props)) {
              transformedProps[key] = transformer(rawProps[key]);
            }
            return transformedProps as any;
          };
        },
        /**
         * イベントハンドラオブジェクトを受け取り、イベントを発火する関数を返します。
         * Accepts an object with event handlers and returns a function to emit events.
         * @param events - イベントハンドラオブジェクト (Object with event handlers)
         * @returns イベントを発火する関数 (Function to emit events)
         */
        defineEmits: (events: Record<`on-${string}`, (detail: any) => void>) => {
          const emit = (type: any, detail?: any, options?: { bubbles?: boolean; composed?: boolean; cancelable?: boolean }) => {
            if (type in events) {
              this.dispatchEvent(
                new CustomEvent(type, {
                  detail,
                  bubbles: true,
                  composed: true,
                  cancelable: true,
                  ...options,
                }),
              );
            }
          };

          // 各イベント用のヘルパー関数を追加
          for (const eventName of Object.keys(events)) {
            const methodName = eventName.replace(/^on-/, "");
            (emit as any)[methodName] = (detail: any, options?: any) => {
              emit(eventName, detail, options);
            };
          }

          return emit as any;
        },
        onConnected: (cb) => {
          onConnectedBase(cb, this.constructor);
        },
        onDisconnected: (cb) => {
          onDisconnectedBase(cb, this.constructor);
        },
        onAttributeChanged: (cb) => {
          onAttributeChangedBase(cb, this.constructor);
        },
        onAdopted: (cb) => {
          onAdopted(cb, this.constructor);
        },
        /**
         * ホスト要素（このカスタム要素自身）を取得します
         * Returns the host element (this custom element itself)
         * @returns ホスト要素（HTMLElement）
         */
        getHost: () => {
          return this;
        },
        /**
         * ShadowRootを取得します（存在する場合）
         * Returns the ShadowRoot if it exists
         * @returns ShadowRoot または null
         */
        getShadowRoot: () => {
          return this.shadowRoot;
        },
        /**
         * ElementInternalsを取得します（formAssociated時のみ有効）
         * Returns ElementInternals if formAssociated is enabled
         * @returns ElementInternals または undefined
         */
        getInternals: (() => {
          let internals: ElementInternals | undefined;
          return () => {
            if (!internals && (this.constructor as any).formAssociated && this.attachInternals) {
              internals = this.attachInternals();
            }
            return internals;
          };
        })(),
      });

      const renderCallback = () => {
        const node = render();

        if (!node && node !== 0) {
          return;
        }

        const newVNode = genVNode(node);
        const shadowRootInstance = this.shadowRoot;

        if (!shadowRootInstance) {
          this.#shadowRoot = newVNode.props.shadowRoot ?? true;
          this.#shadowRootMode = newVNode.props.shadowRootMode ?? "open";
          this.#style = newVNode.props.style;

          return;
        };

        if (this._vnode == null) {
          const children = shadowRootInstance.children;

          for (let i = children.length - 1; i >= 0; i--) {
            if (children[i].tagName !== "STYLE") {
              shadowRootInstance.removeChild(children[i]);
            }
          }

          if (newVNode.tag === "#fragment") {
            // fragmentの場合は子要素を個別にマウント
            for (const child of newVNode.children) {
              const childNode = typeof child === "string"
                ? document.createTextNode(child)
                : mount(child, shadowRootInstance);
              shadowRootInstance.appendChild(childNode);
            }
          }
          else if (newVNode.tag === "#root") {
            this.#shadowRoot = newVNode.props.shadowRoot ?? true;
            this.#shadowRootMode = newVNode.props.shadowRootMode ?? "open";
            this.#style = newVNode.props.style;

            for (const child of newVNode.children) {
              const childNode = typeof child === "string"
                ? document.createTextNode(child)
                : mount(child, shadowRootInstance);
              shadowRootInstance.appendChild(childNode);
            }
          }
          else {
            shadowRootInstance.appendChild(mount(newVNode, shadowRootInstance));
          }
        }
        else {
          if (
            (this._vnode.tag === "#fragment" && newVNode.tag === "#fragment")
            || (this._vnode.tag === "#root" && newVNode.tag === "#root")
          ) {
            // 両方fragmentの場合は子要素レベルでpatch
            const oldChildren = this._vnode.children;
            const newChildren = newVNode.children;
            const maxLen = Math.max(oldChildren.length, newChildren.length);

            for (let i = 0; i < maxLen; i++) {
              const oldChild = i < oldChildren.length ? oldChildren[i] : undefined;
              const newChild = i < newChildren.length ? newChildren[i] : undefined;

              if (oldChild && newChild) {
                // 既存子要素の更新
                const childNodes = shadowRootInstance.childNodes;
                let targetNode: Node | null = null;
                let nodeIndex = 0;
                for (let j = 0; j < childNodes.length; j++) {
                  const node = childNodes[j];
                  if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== "STYLE") {
                    if (nodeIndex === i) {
                      targetNode = node;
                      break;
                    }
                    nodeIndex++;
                  }
                  else if (node.nodeType === Node.TEXT_NODE) {
                    if (nodeIndex === i) {
                      targetNode = node;
                      break;
                    }
                    nodeIndex++;
                  }
                }
                if (targetNode) {
                  const oldVNode = typeof oldChild === "string"
                    ? { tag: "#text", props: {}, children: [oldChild] }
                    : oldChild;
                  const newVNode = typeof newChild === "string"
                    ? { tag: "#text", props: {}, children: [newChild] }
                    : newChild;
                  patch(oldVNode, newVNode, shadowRootInstance, targetNode);
                }
              }
              else if (!oldChild && newChild) {
                // 新しい子要素の追加
                const childNode = typeof newChild === "string"
                  ? document.createTextNode(newChild)
                  : mount(newChild, shadowRootInstance);
                shadowRootInstance.appendChild(childNode);
              }
              else if (oldChild && !newChild) {
                // 古い子要素の削除
                const childNodes = shadowRootInstance.childNodes;
                let targetNode: Node | null = null;
                let nodeIndex = 0;
                for (let j = 0; j < childNodes.length; j++) {
                  const node = childNodes[j];
                  if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== "STYLE") {
                    if (nodeIndex === i) {
                      targetNode = node;
                      break;
                    }
                    nodeIndex++;
                  }
                  else if (node.nodeType === Node.TEXT_NODE) {
                    if (nodeIndex === i) {
                      targetNode = node;
                      break;
                    }
                    nodeIndex++;
                  }
                }
                if (targetNode) {
                  shadowRootInstance.removeChild(targetNode);
                }
              }
            }
          }
          else {
            // 通常のpatch処理
            // DOM構造内での適切なインデックスを効率的に見つける
            let domIndex = 0;
            const childNodes = shadowRootInstance.childNodes;
            for (let i = 0; i < childNodes.length; i++) {
              const node = childNodes[i];
              if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== "STYLE") {
                domIndex = i;
                break;
              }
            }

            patch(this._vnode, newVNode, shadowRootInstance, childNodes[domIndex]);
          }
        }
        this._vnode = newVNode;
      };
      this._renderCallback = renderCallback;

      // MutationObserverのセットアップ（バッチ処理を使って最適化）
      this._attributeObserver = new MutationObserver((mutationRecords) => {
        if (mutationRecords.length === 0)
          return;

        // バッチ処理を開始して、複数の属性変更を1度にまとめて処理
        startBatch();

        // 変更された属性を格納するオブジェクト
        const changedAttributes: Record<string, { oldValue: string | null; newValue: string | null }> = {};

        // まず全ての変更を収集
        for (const record of mutationRecords) {
          if (
            record.type === "attributes"
            && record.attributeName
            && this.observedAttributes.includes(record.attributeName)
          ) {
            const name = record.attributeName;
            changedAttributes[name] = {
              oldValue: record.oldValue,
              newValue: this.getAttribute(name),
            };
          }
        }

        // 一度にpropsを更新
        if (Object.keys(changedAttributes).length > 0) {
          this.props[1]((prev) => {
            const newProps = { ...prev };
            for (const [name, { newValue }] of Object.entries(changedAttributes)) {
              newProps[name] = newValue === null ? undefined : newValue;
            }
            return newProps;
          });

          // 各属性変更に対してハンドラを呼び出し
          for (const [name, { oldValue, newValue }] of Object.entries(changedAttributes)) {
            this.handleAttributeChanged(name, oldValue, newValue);
          }
        }

        // バッチ処理を終了
        endBatch();
      });
    }

    handleConnected() {}
    connectedCallback() {
      // observedAttributesが空でない場合のみMutationObserverを設定
      if (this.observedAttributes.length > 0) {
        this._attributeObserver.observe(this, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: [...this.observedAttributes],
        });
      }

      // 初回のみeffect/renderCallbackを登録
      if (!this._effectInitialized && this._renderCallback) {
        this._renderCallback();

        // shadowRootの生成とスタイル適用を1回の処理にまとめる
        if (this.#shadowRoot) {
          const shadowRootInstance = this.attachShadow({ mode: this.#shadowRootMode ?? "open" });
          // スタイルがある場合のみ適用処理を実行
          if (this.#style) {
            applyStyles(shadowRootInstance, this.#style);
          }
        }

        // props変更とレンダリングを連動させるエフェクト
        effect(() => {
          this.props[0](); // props値の監視
          this._renderCallback!();
        });

        this._effectInitialized = true;
      }

      this.handleConnected();
    }

    handleDisconnected() {}
    disconnectedCallback() {
      // MutationObserverの監視停止
      this._attributeObserver.disconnect();
      this.handleDisconnected();
    }

    handleAttributeChanged(_name: string, _oldValue: string | null, _newValue: string | null) {}
  };
};

export { functionalCustomElement };
