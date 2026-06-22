import type { ComponentProps } from "react";

/** Full page navigation — triggers the browser tab loading spinner. */
export function PageLink({
  href,
  children,
  className,
  ...props
}: ComponentProps<"a"> & { href: string }) {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
}
