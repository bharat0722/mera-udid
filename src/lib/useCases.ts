import { useMemo, useSyncExternalStore } from "react";
import { getSnapshot, subscribe, type CaseStoreSnapshot } from "../core/caseStore";
import { projectCase, type CaseView } from "../core/projections";
import { queueAnchorAt, type QueueEntry } from "../core/queue";
import { deriveCurrentStage } from "../core/projections";

/** Subscribes a component to the case store. */
export function useCaseStore(): CaseStoreSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * The projected view of one case, or null when the event log cannot place it. The
 * null is meaningful and the screens handle it — it is what a lost application looks
 * like from the inside.
 */
export function useCase(applicationId: string | null): CaseView | null {
  const store = useCaseStore();
  return useMemo(() => {
    if (!applicationId) return null;
    const application = store.applicationsById.get(applicationId);
    if (!application) return null;
    return projectCase(application, store.eventsByApplication.get(applicationId) ?? []);
  }, [store, applicationId]);
}

/** True when the id exists in the register but cannot be placed in any stage. */
export function useIsUnplaceable(applicationId: string | null): boolean {
  const store = useCaseStore();
  if (!applicationId) return false;
  if (!store.applicationsById.has(applicationId)) return false;
  return (
    deriveCurrentStage(store.eventsByApplication.get(applicationId) ?? []) === null
  );
}

/** Cases that have been escalated to a higher authority, by application id. */
export function useEscalatedIds(): ReadonlySet<string> {
  const store = useCaseStore();
  return useMemo(() => {
    const ids = new Set<string>();
    for (const [applicationId, events] of store.eventsByApplication) {
      if (events.some((event) => event.type === "ESCALATED")) ids.add(applicationId);
    }
    return ids;
  }, [store]);
}

/** Every case that can be placed in a stage, projected. Memoised on the snapshot. */
export function useAllCaseViews(): CaseView[] {
  const store = useCaseStore();
  return useMemo(() => {
    const views: CaseView[] = [];
    for (const application of store.applications) {
      const view = projectCase(
        application,
        store.eventsByApplication.get(application.applicationId) ?? []
      );
      if (view) views.push(view);
    }
    return views;
  }, [store]);
}

/** Queue entries for every placeable case, used to work out a position. */
export function useQueueEntries(): QueueEntry[] {
  const store = useCaseStore();
  return useMemo(() => {
    const entries: QueueEntry[] = [];
    for (const application of store.applications) {
      const events = store.eventsByApplication.get(application.applicationId) ?? [];
      const stage = deriveCurrentStage(events);
      if (stage === null) continue;
      entries.push({
        applicationId: application.applicationId,
        district: application.applicant.district,
        stage,
        anchorAt: queueAnchorAt(application, events)
      });
    }
    return entries;
  }, [store]);
}
