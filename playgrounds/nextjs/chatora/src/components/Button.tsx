import { toMatched } from "@chatora/util";
import { signal, type CC } from "chatora";
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

  const [clickCount, setClickCount] = signal(0);

  return () => {
    return (
      <Host style={[ButtonStyle]}>
        <button
          type={props().type}
          onClick={() => {
            setClickCount((count) => count + 1);
            emits("on-click", { count: clickCount()
          });
        }}>
          aaaa
          <span>Click count: {clickCount()}</span>
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
`

// export const NButtonElement = functionalCustomElement(Button, { styles: [ButtonStyle] });
// export const NButtonHast = functionalDeclarativeCustomElement(Button, { styles: [ButtonStyle] });