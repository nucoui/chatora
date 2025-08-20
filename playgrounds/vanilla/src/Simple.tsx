import { createCC } from "chatora";

const {
  component: _SimpleElement,
  define: defineSimpleElement
} = createCC("simple-element", () => {
  return () => (
    <div>
      <h1>Simple Element</h1>
      <p>This is a simple custom element.</p>
    </div>
  );
});

defineSimpleElement();
