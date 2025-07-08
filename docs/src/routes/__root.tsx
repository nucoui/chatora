/// <reference types="vite/client" />

import type { ReactNode } from "react";
import { ColorSchemeProvider } from "@nuco/react";
import nucoStyle from "@nuco/variable/css.css?url";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import reestStyle from "./__reset.css?url";
import root from "./__root.scss?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0 viewport-fit=cover" },
      { name: "description", content: "Chatora.js is a library that generates Web Components and static HTML for SSR using JSX/TSX syntax." },
      { name: "keywords", content: "JSX, TSX, Web Components, SSR, static HTML, TypeScript, Chatora.js, Custom Elements, Library, Reactivity" },
      { name: "author", content: "takuma-ru@takumaru.dev" },
      { name: "publisher", content: "takuma-ru@takumaru.dev" },
      { property: "og:title", content: "Chatora.js" },
      { property: "og:description", content: "Chatora.js is a library that generates Web Components and static HTML for SSR using JSX/TSX syntax." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://chatora.dev/" },
      { property: "og:image", content: "https://chatora.dev/icon-dark-transparent.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Chatora.js" },
      { name: "twitter:description", content: "Chatora.js is a library that generates Web Components and static HTML for SSR using JSX/TSX syntax." },
      { name: "twitter:image", content: "https://chatora.dev/icon-dark-transparent.svg" },
      { title: "Chatora.js" },
    ],
    links: [
      { rel: "icon", href: "/icon-dark-transparent.svg" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icon-dark-transparent.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icon-dark-transparent.svg" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/icon-dark-transparent.svg" },
      { rel: "canonical", href: "https://chatora.dev/" },
      { rel: "stylesheet", href: root },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" },
      { rel: "stylesheet", href: nucoStyle },
      { rel: "stylesheet", href: reestStyle },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ColorSchemeProvider>
        <Outlet />
      </ColorSchemeProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Chatora.js",
              "url": "https://chatora.takumaru.dev/",
              "description": "Chatora.js is a library that generates Web Components and static HTML for SSR using JSX/TSX syntax.",
              "publisher": {
                "@type": "Organization",
                "name": "Chatora.js",
                "url": "https://chatora.takumaru.dev/",
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
