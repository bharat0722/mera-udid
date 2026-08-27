import type { ReactNode } from "react";

/**
 * A table that can scroll sideways on a narrow screen.
 *
 * The tabIndex is the point of this component. A region that scrolls but cannot take
 * focus is unreachable to anyone driving the page from a keyboard — they can see that
 * there is more table to the right and have no way to get to it. Making the wrapper
 * focusable and naming it fixes that, and is what axe's scrollable-region-focusable
 * rule is asking for.
 */
export function TableScroll({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}
