import type { ChatoraNode } from "@/jsx-runtime";
import type { IC, StyleInput } from "@/main";
import { ROOT_TAG } from "@/constants/TAG";

type Props = {
  children: ChatoraNode;
  shadowRoot?: boolean;
  style?: StyleInput;
} & ({
  shadowRoot?: true;
  shadowRootMode?: "open" | "closed";
} | {
  shadowRoot?: false;
  shadowRootMode?: never;
});

export const Host: IC<Props> = ({ children, ...rest }) => {
  return () => ({
    tag: ROOT_TAG,
    props: {
      children: Array.isArray(children) ? children : [children],
      ...rest,
    },
  });
};
