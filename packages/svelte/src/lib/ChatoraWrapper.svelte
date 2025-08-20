<script lang="ts">
  import type { CC } from "chatora";
  import { genSD } from "chatora";
  import { onMount } from "svelte";
  // import { browser } from '$app/environment'; // SvelteKitの場合

  export let tag: string;
  export let component: CC;
  export let props: Record<string, string | undefined> = {};

  let ref: HTMLElement | null = null;

  let isClient = false;
  let isDefined = false;

  onMount(() => {
    isClient = true;

    const Element = genSD(component);

    isDefined = customElements.get(tag) !== undefined;

    if (!isDefined) {
      customElements.define(tag, Element);
      isDefined = true;
    }

    if (ref) {
      Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith("on") && value && typeof value === "function") {
          ref!.addEventListener(`on-${key.slice(2).toLowerCase()}`, value);
        }
        else if (value !== undefined) {
          ref!.setAttribute(key, value);
        }
        else {
          ref!.removeAttribute(key);
        }
      });
    }
  });

  $: if (isClient && ref) {
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("on") && value && typeof value === "function") {
        ref!.addEventListener(`on-${key.slice(2).toLowerCase()}`, value);
      }
      else if (value !== undefined) {
        ref!.setAttribute(key, value);
      }
      else {
        ref!.removeAttribute(key);
      }
    });
  }
</script>

{#if isClient}
  <svelte:element bind:this={ref} this={tag}>
    <slot />
  </svelte:element>
{:else}
  <!-- TODO: 未実装 -->
  <svelte:element this={tag}>
    <slot />
  </svelte:element>
{/if}
