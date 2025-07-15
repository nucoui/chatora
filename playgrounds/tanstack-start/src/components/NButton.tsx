"use client";

import type { PropsWithChildren } from "react";
import { Button } from "../../chatora-components/Button"
import { ChatoraWrapper } from "@chatora/react/components/ChatoraWrapper";
import type { Props as ButtonProps, Emits } from "../../chatora-components/Button";
import type { toReactEmits } from "@chatora/react";

export const NButton = ({
  children,
  ...props
}: PropsWithChildren<ButtonProps & toReactEmits<Emits>>) => ChatoraWrapper({
  tag: "n-button",
  props: { ...props },
  children: children as unknown as any,
  component: Button,
})
