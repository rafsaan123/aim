"use client";

import type { ReactNode } from "react";
import { useSecureViewer, useVisibilityShield } from "./useSecureViewer";

type SecureViewerShellProps = {
  children: ReactNode;
};

export function SecureViewerShell({ children }: SecureViewerShellProps) {
  useSecureViewer(true);
  const hidden = useVisibilityShield(true);

  return (
    <div
      className="secure-viewer relative select-none"
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
      {hidden ? (
        <div
          className="pointer-events-none fixed inset-0 z-[100] bg-black/85"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
