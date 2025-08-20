import { IC, createCC, signal, effect, getHost } from "chatora";
import { Button } from "./Button";
import { Host } from "chatora/jsx-runtime";

const Test: IC<{ count: { value: number } }> = ({ count }) => {
  return () => {
    return (
      <div>
        <h1>Test Component</h1>
        <p>This is a test component.</p>
        <p>Count: {count.value}</p>
      </div>
    );
  }
}

const {
  define
} = createCC("mini-element", () => {
  const count = signal(0);

  effect(() => {
    console.log("Count changed:", count.value);
  });

  console.log("getHost:", getHost());

  return () => (
    <Host shadowRoot shadowRootMode="open" style={[`
      button {
        margin: 0 5px;
        padding: 5px 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `]}>
      <h1 style={{
        color: "darkblue",
        fontSize: 24,
        marginBottom: 10,
        textAlign: "center"
      }}>Mini</h1>
      <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
        <path fill="currentColor" d="M11.475 14.475L7.85 10.85q-.075-.075-.112-.162T7.7 10.5q0-.2.138-.35T8.2 10h7.6q.225 0 .363.15t.137.35q0 .05-.15.35l-3.625 3.625q-.125.125-.25.175T12 14.7t-.275-.05t-.25-.175" />
      </svg>
      <p style={{
        marginTop: 8,
        lineHeight: 1.6,
        fontWeight: count.value > 5 ? "bold" : "normal"
      }}>Count: {count.value}</p>
      <>
        <button style={{
          backgroundColor: count.value % 2 === 0 ? "black" : "blue",
          fontSize: 14,
          fontWeight: "bold",
          border: "2px solid",
          borderColor: count.value > 10 ? "orange" : "transparent",
          borderRadius: count.value > 5 ? 20 : 4,
          padding: "8px 16px",
          transition: "all 0.3s ease"
        }} onClick={() => count.set((c) => c + 1)}>Increment (next value: {count.value + 1})</button>
        <button
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            marginLeft: 5,
            opacity: count.value <= 0 ? 0.5 : 1,
            cursor: count.value <= 0 ? "not-allowed" : "pointer"
          }}
          disabled={count.value <= 0}
          onClick={() => count.set((c) => c - 1)}
        >
          Decrement (next value: {count.value - 1})
        </button>
      </>
      <>
        <p>in fragment</p>
      </>
      <>
          <Button type="anchor">
            <span>Primary Button</span>
          </Button>
      </>
      {
        count.value % 2 === 0
        ? <Test count={count} />
        : <>
            <h2>Odd Count</h2>
            <p>The count is currently odd.</p>
          </>
      }
    </Host>
  )
}, {
  formAssociated: false
})

define();

const mini = document.createElement("mini-element");
document.querySelector("#app")?.appendChild(mini);
