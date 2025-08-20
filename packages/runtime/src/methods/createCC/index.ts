import type { ChatoraNode } from "@/jsx-runtime";
import type { IC } from "@/main";
import type { ChatoraComponent } from "@root/types/GenSD";
import { jsx } from "@/jsx-runtime";
import { genDSD } from "@/methods/genDSD/index";
import { genSD } from "@/methods/genSD/index";
import { hastToJsx } from "@/utils/hastToJsx";

export type toChatoraEmits<T extends Record<string, any>> = {
  [K in keyof T as K extends `on-${infer K2}` ? `on${Capitalize<K2>}` : never]: (payload: CustomEvent<T[K]>) => void;
};

export type CreateCCParams<
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<never, never>,
> = {
  tagName: `${string}-${string}${string}`;
  cc: ChatoraComponent<P, E>;
  options?: {
    formAssociated?: boolean;
  };
};

export type CreateCCReturn<
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<never, never>,
> = {
  component: IC<P & toChatoraEmits<E> & { children: ChatoraNode }>;
  define: () => void;
  genDSD: (props: P & { children: ChatoraNode }) => ReturnType<typeof genDSD>;
  genSD: () => ReturnType<typeof genSD>;
};

export const createCC = <
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<never, never>,
>(
  tagName: CreateCCParams<P, E>["tagName"],
  cc: CreateCCParams<P, E>["cc"],
  options?: CreateCCParams<P, E>["options"],
): CreateCCReturn<P, E> => {
  return {
    component: (props) => {
      if (!customElements) {
        const declarativeCustomElementHast = genDSD<any, any>(cc, props as any);
        const element = hastToJsx(declarativeCustomElementHast);

        return () => element;
      }

      if (!customElements.get(tagName)) {
        class elementClass extends genSD(cc) {
          static formAssociated = options?.formAssociated ?? false;
        }

        customElements.define(tagName, elementClass);
      }

      return () => jsx(tagName, props);
    },
    define: () => {
      if (!customElements) {
        console.warn("Custom elements are not supported");
        return;
      }

      if (!customElements.get(tagName)) {
        class elementClass extends genSD(cc) {
          static formAssociated = options?.formAssociated ?? false;
        }

        customElements.define(tagName, elementClass);
      }
    },
    genDSD: (props) => {
      return genDSD(cc, {
        props: props as any,
      });
    },
    genSD: () => {
      return genSD(cc);
    },
  };
};
