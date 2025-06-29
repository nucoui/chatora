import { CC, effect, functionalCustomElement, getHost, getInternals, getShadowRoot, getSlotteds, onAdopted, onAttributeChanged, onConnected, onDisconnected, signal } from "chatora";
import { Host } from "chatora/jsx-runtime";

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

  defineEmits({
    "on-click": () => {},
  });

  const status = signal({
    connected: false,
    disconnected: false,
    adopted: false,
    attributeChanged: false,
  });

  const host = getHost();
  const internals = getInternals();
  const shadowRoot = getShadowRoot();
  const slotteds = getSlotteds();

  effect(() => {
    console.log("slotteds:", slotteds.value);
    // console.log(host()?.querySelectorAll("*"))
  });

  onConnected(() => {
    status.set((prev) => ({ ...prev, connected: true }));

    console.log("getSlotteds", slotteds.value);
    console.log("getInternals", internals.value);
    console.log("getShadowRoot", shadowRoot.value);

    console.log("Component connected to the DOM");
  });

  onDisconnected(() => {
    status.set((prev) => ({ ...prev, disconnected: true }));
    console.log("Component disconnected from the DOM");
  });

  onAdopted(() => {
    status.set((prev) => ({ ...prev, adopted: true }));
    console.log("Component adopted to a new document");
  });

  onAttributeChanged(() => {
    status.set((prev) => ({ ...prev, attributeChanged: true }));
    console.log("Component attributes changed");
  });

  // setInterval(() => {
  //   const child = document.createElement("p")
  //   child.appendChild(document.createTextNode("New paragraph added at " + new Date().toLocaleTimeString()))
  //   host.value?.appendChild(child);
  // } , 5000);

  return () => (
    <Host>
      <div>
        <h3>Get methods</h3>
        <p>Host: {host.value?.tagName}</p>
        <p>Internals: {internals.value?.toString() ?? "null"}</p>
        <p>Shadow Root: {String(shadowRoot.value?.isConnected)}</p>
        <p>Slotteds: {slotteds.value?.length}</p>
      </div>
      <div>
        <h3>Life Cycle</h3>
        {status.value.connected ? (
          <p>Connected: {props().name}</p>
        ) : (
          <p>Not connected</p>
        )}
        {status.value.disconnected ? (
          <p>Disconnected</p>
        ) : (
          <p>Still connected</p>
        )}
        {status.value.adopted ? (
          <p>Adopted to a new document</p>
        ) : (
          <p>Not adopted</p>
        )}
        {status.value.attributeChanged ? (
          <p>Attributes changed</p>
        ) : (
          <p>No attribute changes</p>
        )}
      </div>
      <div>
        <h3>Action</h3>
        <button
          onClick={() => {
            console.log(slotteds.value);
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

// setInterval(() => {
//   const child = document.createElement("p");
//   child.appendChild(document.createTextNode("New paragraph added at " + new Date().toLocaleTimeString()));
//   lifecycleInstance.appendChild(child);
// }, 5000);