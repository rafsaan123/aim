"use client";

import { useEffect, useState } from "react";

export function useSecureViewer(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const blockContextMenu = (e: Event) => e.preventDefault();
    const blockDrag = (e: Event) => e.preventDefault();
    const blockSelect = (e: Event) => e.preventDefault();

    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const blocked =
        key === "printscreen" ||
        key === "f12" ||
        ((e.ctrlKey || e.metaKey) &&
          ["s", "p", "c", "u", "a"].includes(key)) ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key));

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("dragstart", blockDrag);
    document.addEventListener("selectstart", blockSelect);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("copy", blockCopy);

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("dragstart", blockDrag);
      document.removeEventListener("selectstart", blockSelect);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("copy", blockCopy);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [enabled]);
}

export function useVisibilityShield(enabled = true) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => setHidden(document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled]);

  return hidden;
}
