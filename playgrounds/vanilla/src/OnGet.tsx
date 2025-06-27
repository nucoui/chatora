import { CC, effect, functionalCustomElement, getHost, getInternals, getShadowRoot, getSlotteds, onAdopted, onAttributeChanged, onConnected, onDisconnected, signal } from "chatora";
import { Host } from "chatora/jsx-runtime";
import { Signal } from "@chatora/reactivity";

type Props = {
  name?: string;
};

type Emits = {
  "on-click": Event;
};

const lifecycle: CC<Props, Emits> = ({
  defineProps,
  defineEmits,
}) => {
  const props = defineProps({
    name: (v) => v || "World",
  });

  const emits = defineEmits({
    "on-click": () => {},
  });

  const [status, setStatus] = signal({
    connected: false,
    disconnected: false,
    adopted: false,
    attributeChanged: false,
  })

  const host = getHost();
  const internals = getInternals();
  const shadowRoot = getShadowRoot();
  const slotteds = getSlotteds();

  effect(() => {
    console.log("slotteds:", slotteds());
    // console.log(host()?.querySelectorAll("*"))
  });

  onConnected(() => {
    setStatus((prev) => ({ ...prev, connected: true }));

    console.log("getSlotteds", slotteds());
    console.log("getInternals", internals());
    console.log("getShadowRoot", shadowRoot());

    console.log("Component connected to the DOM");
  });

  onDisconnected(() => {
    setStatus((prev) => ({ ...prev, disconnected: true }));
    console.log("Component disconnected from the DOM");
  });

  onAdopted(() => {
    setStatus((prev) => ({ ...prev, adopted: true }));
    console.log("Component adopted to a new document");
  });

  onAttributeChanged(() => {
    setStatus((prev) => ({ ...prev, attributeChanged: true }));
    console.log("Component attributes changed");
  });

  setInterval(() => {
    const child = document.createElement("p")
    child.appendChild(document.createTextNode("New paragraph added at " + new Date().toLocaleTimeString()))
    host()?.appendChild(child);
  } , 5000);

  return () => (
    <Host>
      <div>
        <h3>Get methods</h3>
        <p>Host: {host()?.tagName}</p>
        <p>Internals: {internals()?.toString() ?? "null"}</p>
        <p>Shadow Root: {String(shadowRoot()?.isConnected)}</p>
        <p>Slotteds: {slotteds()?.length}</p>
      </div>
      <div>
        <h3>Life Cycle</h3>
        {status().connected ? (
          <p>Connected: {props().name}</p>
        ) : (
          <p>Not connected</p>
        )}
        {status().disconnected ? (
          <p>Disconnected</p>
        ) : (
          <p>Still connected</p>
        )}
        {status().adopted ? (
          <p>Adopted to a new document</p>
        ) : (
          <p>Not adopted</p>
        )}
        {status().attributeChanged ? (
          <p>Attributes changed</p>
        ) : (
          <p>No attribute changes</p>
        )}
      </div>
      <div>
        <h3>Action</h3>
        <button
          onClick={() => {
            console.log(slotteds());
          }}
        >
          Get Slotteds
        </button>
      </div>
      <div>
        <h3>
          Slot
        </h3>
        <slot></slot>
      </div>
    </Host>
  );
};

const lifecycleElement = functionalCustomElement(lifecycle)

if (!customElements.get("lifecycle-element")) {
  customElements.define("lifecycle-element", lifecycleElement);
}

const lifecycleInstance = document.createElement("lifecycle-element");

const child = document.createElement("h1");
child.textContent = "Hello, World!";
lifecycleInstance.appendChild(child);

document.querySelector("#app")?.appendChild(lifecycleInstance);

lifecycleInstance.setAttribute("name", "Chatora");
