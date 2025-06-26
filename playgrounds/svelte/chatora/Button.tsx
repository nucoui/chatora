import { toMatched } from "@chatora/util";
import { signal, type CC } from "chatora";
import { Host } from "chatora/jsx-runtime";

export type Props = {
  type: "button" | "submit" | "reset";
}

export type Emits = {
  "on-click": { count: number, msg: string };
  "on-event": { type: string; detail: { count: number } };
}

export const Button: CC<Props, Emits> = ({ defineProps, defineEmits }) => {
  const props = defineProps({
    type: (v) => toMatched(v, ["button", "submit", "reset"]) || "button",
  });

  const emits = defineEmits({
    "on-click": () => {},
    "on-event": () => {}
  });

  const [clickCount, setClickCount] = signal(0);

  return () => {
    return (
      <Host style={[ButtonStyle]}>
        <button
          type={props().type}
          onClick={() => {
            setClickCount((count) => count + 2);
            emits("on-click", { count: clickCount(), msg: "From Chatora.js" });
            emits("on-event", { type: "click", detail: { count: clickCount() } });
        }}>
          <span>Click count: {clickCount()}</span>
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
    color: red;
    background-color: yellow;
    border: 1px solid black;
    padding: 10px;
    border-radius: 5px;
    }
    button:hover {
    background-color: orange;
  }
  button[type="submit"] {
    background-color: green;
  }
`
