import { Badge } from "@nuco/react/components/Badge";
import { Button } from "@nuco/react/components/Button";
import { Divider } from "@nuco/react/components/Divider";
import { H1 } from "@nuco/react/components/H1";
import { H3 } from "@nuco/react/components/H3";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./index.module.scss";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async (_ctx) => {
    const chatoraVersion = await fetch("https://registry.npmjs.org/chatora");

    if (!chatoraVersion.ok) {
      throw new Error("Failed to fetch Chatora version");
    }

    const data = await chatoraVersion.json();
    const latestVersion = data["dist-tags"].latest;

    return {
      chatoraVersion: latestVersion,
    };
  },
});

function Home() {
  // const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <main className={styles["main-content"]}>
      <H1>
        Chatora.js
        <Badge type="tertiary" text={`v${state.chatoraVersion}`} />
      </H1>
      <div className={styles.description}>
        <H3>Description</H3>
        <p>It is a framework that allows you to implement custom elements in a React-like manner.</p>
        <p>Usually, knowledge of classes is required, but since the implementation is function-based, this knowledge is not necessary!</p>
      </div>
      <Divider text="links" textPosition="end" />
      <div className={styles.links}>
        <Button type="anchor" href="https://github.com/nucoui/chatora" target="_blank">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" /></svg>
            GitHub
          </span>
        </Button>
        <Button type="anchor" variant="secondary" href="https://www.npmjs.com/package/chatora" target="_blank">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M4 28V4h24v24zM8.5 8.5v15H16v-12h4.5v12h3v-15z" /></svg>
            npm
          </span>
        </Button>
      </div>
      <div className={styles.circle} />
    </main>
  );
}
