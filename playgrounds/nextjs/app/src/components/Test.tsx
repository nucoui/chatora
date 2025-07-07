"use client";

import {
  FC,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { renderToString } from "react-dom/server";
import { jsx } from "react/jsx-runtime";

export const Test: FC<PropsWithChildren> = ({ children }) => {
  const [text, setText] = useState<ReactElement>(<>SSR</>);

  useEffect(() => {
    setText(<><h1>CSR</h1></>);
  }, [children]);

  if (typeof window === "undefined") {
    console.log(new Date().toLocaleString(), "server");

    return jsx("div", {
      dangerouslySetInnerHTML: {
        __html: renderToString(text),
      },
      suppressHydrationWarning: true,
    });
  } else {
    console.log(new Date().toLocaleString(), "client");

    return jsx("div", {
      children: text,
      suppressHydrationWarning: true,
    });
  }
};
