import { toMatched } from "@chatora/util";
import { onConnected, signal, type CC } from "chatora";
import { Host } from "chatora/jsx-runtime";

export type Emits = {
  "on-click": { count: number };
  "on-hover": MouseEvent;
}

export type Props = {
  type: "button" | "submit" | "reset";
}

export const Button: CC<Props, Emits> = ({ defineProps, defineEmits }) => {
  const props = defineProps({
    type: (v) => toMatched(v, ["button", "submit", "reset"]) || "button",
  });

  const emits = defineEmits({
    "on-click": () => {},
    "on-hover": () => {},
  });

  const clickCount = signal(0);

  onConnected(() => {
    console.log("Button component connected");
  });

  return () => {
    return (
      <Host style={[ButtonStyle]}>
        <button
          type={props().type}
          onClick={() => {
            clickCount.set((count) => count + 1);
            emits("on-click", { count: clickCount.value });
          }}>
          aaaa
          <span>Click count: {clickCount.value}</span>
          <slot />
          <slot name="slot1" />
        </button>
      </Host>
    );
  }
}

export const ButtonStyle = `
  button {
    color: red;
    background-color: yellow;
    border: 1px solid black;
    padding: 10px;
    border-radius: 5px;
    }
    button:hover {
    background-color: orange;
  }

  ::slotted(span) {
    color: blue;
  }
`

// export const NButtonElement = createCC("n-button", Button);
// export const NButtonHast = genDSD(Button);