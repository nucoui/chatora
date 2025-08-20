import { genDSD, genSD } from "chatora";
import { defineComponent, getCurrentInstance, h, onMounted, ref } from "vue";
import { hastToJsx } from "../utils/hastToJsx";

export type WrapperProps<P extends Record<string, unknown> = Record<string, unknown>, E extends Record<`on-${string}`, any> = Record<`on-${string}`, never>> = {
  props: P & E;
  tag: string;
  // eslint-disable-next-line ts/no-unsafe-function-type
  component: Function;
};

export default defineComponent<WrapperProps>({
  name: "ChatoraWrapper",
  props: {
    tag: { type: String, required: true },
    props: { type: Object, required: true },
    component: { type: Function, required: true },
    shadowRoot: { type: Boolean, default: true },
    shadowRootMode: { type: String, default: "open" },
    styles: { type: Array as () => string[], default: () => [] },
  },
  setup(rawProps, { slots }) {
    const isDefined = ref(false);
    const tagRef = ref<HTMLElement | null>(null);
    const instance = getCurrentInstance();

    // props/emits分離
    const splitProps = (props: Record<string, unknown>) => {
      const emits: Record<string, (event: Event) => void> = {};
      const filteredProps: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (key.startsWith("on-") && typeof value === "function") {
          emits[key] = value as (event: Event) => void;
        }
        else {
          filteredProps[key] = value;
        }
      }
      return { props: filteredProps, emits };
    };

    const { tag, props: initialProps, component } = rawProps;
    const { props, emits } = splitProps(initialProps);

    // SSR用hast生成
    const hast = genDSD(
      component as any,
      {
        props,
      },
    );

    onMounted(() => {
      if (!customElements || customElements.get(tag))
        return;
      const Element = genSD(component as any);
      customElements.define(tag, Element);
      isDefined.value = true;
      if (tagRef.value) {
        for (const [key, value] of Object.entries(emits)) {
          if (typeof value === "function") {
            tagRef.value.addEventListener(key, value as EventListener);
          }
        }
      }
    });

    return () => {
      const slotContent = slots.default ? slots.default() : [];
      return h(tag as any, {
        ref: tagRef,
        ...props,
        // ...emits,
      }, isDefined.value
        ? slotContent
        : hastToJsx(tag, String(instance?.uid ?? "chatora-ssr"), hast, slotContent));
    };
  },
});
