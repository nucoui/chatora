"use client";

import type { CC } from "chatora";
import type { ReactNode } from "react";
import { hastToJsx } from "@/main";
import { splitProps } from "@/utils/splitProps";
import { functionalCustomElement, functionalDeclarativeCustomElement } from "chatora";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { jsx } from "react/jsx-runtime";

export type Props<P extends Record<string, unknown>, E extends Record<string, unknown>> = {
  props: P & E;
  tag: string;
  formAssociated?: boolean;
  component: CC<P, E>;
  children?: ReactNode;
};

export const ChatoraWrapper = <P extends Record<string, unknown>, E extends Record<string, unknown>>({ tag, component, children, props, formAssociated = false }: Props<P, E>) => {
  const [isDefined, setIsDefined] = useState(false);

  const id = useId();
  const { props: filteredProps, emits } = useMemo(() => splitProps(props || {}), [props]);
  const hast = functionalDeclarativeCustomElement<P>(
    component as CC<P, never>,
    {
      props: filteredProps as P,
    },
  );
  const [content, setContent] = useState<ReactNode>([hastToJsx(hast, `${id}-content`), children]);
  const domRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setContent(children);
  }, [children]);

  useLayoutEffect(() => {
    if (!customElements || customElements.get(tag)) {
      return;
    }

    class element extends functionalCustomElement(component) {
      static formAssociated = formAssociated;
    };

    customElements.define(tag, element);
    setIsDefined(true);
  }, [component, formAssociated, tag]);

  if (!isDefined) {
    return jsx(tag as any, {
      dangerouslySetInnerHTML: {
        __html: renderToString(content),
      },
      suppressHydrationWarning: true,
    }, `${id}-ssr`);
  }
  else {
    return jsx(tag as any, {
      ref: domRef,
      ...filteredProps,
      ...emits,
      children: content,
      suppressHydrationWarning: true,
    }, `${id}-hydration`);
  }
};
