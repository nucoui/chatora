export const splitProps = (props: Record<string, unknown>) => {
  const emits: Record<`on${string}`, (event: Event) => void> = {};
  const filteredProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on") && key.length > 2 && key[2] === key[2].toUpperCase() && typeof value === "function") {
      const sliced = key.slice(2);
      const normalized = sliced.charAt(0).toLowerCase() + sliced.slice(1);
      const kebabKey = `onon-${normalized}`
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase();
      emits[kebabKey as `on${string}`] = value as (event: Event) => void;
    }
    else {
      filteredProps[key] = value;
    }
  }
  return { props: filteredProps, emits };
};
