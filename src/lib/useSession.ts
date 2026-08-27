import { useSyncExternalStore } from "react";
import { getSession, subscribeSession, type DemoAccount } from "../core/session";

/** The signed-in demo account, or null. */
export function useSession(): DemoAccount | null {
  return useSyncExternalStore(subscribeSession, getSession, getSession);
}
