"use client";

import type { ReactNode } from "react";

type SecureViewerShellProps = {
  children: ReactNode;
};

export function SecureViewerShell({ children }: SecureViewerShellProps) {
  return <div className="relative">{children}</div>;
}
