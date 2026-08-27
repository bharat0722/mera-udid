import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * A hash router in forty lines.
 *
 * A routing library would add more to the bundle than the whole rest of the app, and
 * this is a service aimed at people on low-end phones and slow connections where every
 * kilobyte is a real cost. Hash routing also means the built site works from a file
 * path or any static host with no server rewrite rules.
 */

function readHash(): string {
  const raw = window.location.hash.replace(/^#/, "");
  if (raw === "" || raw === "/") return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export interface Route {
  path: string;
  segments: string[];
}

export function useRoute(): Route {
  const [path, setPath] = useState<string>(() =>
    typeof window === "undefined" ? "/" : readHash()
  );

  useEffect(() => {
    const onChange = () => setPath(readHash());
    window.addEventListener("hashchange", onChange);
    // The initial hash may have been set before this effect ran.
    onChange();
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return useMemo(
    () => ({ path, segments: path.split("/").filter(Boolean) }),
    [path]
  );
}

export interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
  id?: string;
}

/**
 * A real anchor with a real href, so the browser's own affordances work: middle-click,
 * copy link, and the screen-reader link rotor all behave as a user expects.
 */
export function Link({ to, children, ...rest }: LinkProps) {
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      navigate(to);
    },
    [to]
  );

  return (
    <a href={`#${to}`} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
