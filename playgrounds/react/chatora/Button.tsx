import { toMatched } from "@chatora/util";
import { signal, type CC } from "chatora";
import { Host } from "chatora/jsx-runtime";

export type Emits = {
  "on-click"?: { count: number };
  "on-hover"?: MouseEvent;
}

export type Props = {
  type: "button" | "submit" | "reset";
}

export const Button: CC<Props, Emits> = ({ defineProps, defineEmits }) => {
  const props = defineProps({
    type: (v) => toMatched(v, ["button", "submit", "reset"]) || "button",
  });

  const emits = defineEmits({
    "on-click": (detail) => detail,
    "on-hover": (event) => event,
  });

  const clickCount = signal(0);

  return () => {
    return (
      <Host style={[ButtonStyle]}>
        <button
          type={props().type}
          onClick={() => {
            clickCount.set((count) => count + 2);
            emits("on-click", {count: clickCount.value});
          }}
          >
          <span>Click count: {clickCount.value}</span>
          <br></br>
          <slot />
          <slot name="slot1" />
        </button>
      </Host>
    );
  }
}

export const ButtonStyle = `
  button {
    border: none;
    border-radius: calc(infinity * 1px);
    padding: 0.75em 2em;
    cursor: pointer;
  }
`
