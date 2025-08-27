import type { ChatoraNode } from "@/jsx-runtime";
import type { CC, StyleInput } from "@/main";
import { ROOT_TAG } from "@/constants/TAG";

type Props = {
  children?: ChatoraNode;
  shadowRoot?: boolean;
  style?: StyleInput;
} & ({
  shadowRoot?: true;
  shadowRootMode?: "open" | "closed";
} | {
  shadowRoot?: false;
  shadowRootMode?: never;
});

export const Host: CC<Props, {}> = ({ defineProps }) => {
  const props = defineProps({
    children: (v) => v as ChatoraNode,
    shadowRoot: (v) => v === "true" || v === "" ? true : v === "false" ? false : undefined,
    shadowRootMode: (v) => v as "open" | "closed" | undefined,
    style: (v) => v as StyleInput,
  });

  return () => ({
    tag: ROOT_TAG,
    props: {
      children: (() => {
        const children = props().children;
        return Array.isArray(children) ? children : [children];
      })(),
      shadowRoot: props().shadowRoot,
      shadowRootMode: props().shadowRootMode,
      style: props().style,
    },
  });
};
