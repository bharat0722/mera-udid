import { deriveCurrentStage } from "./projections";
import { INITIAL_STAGE } from "./stages";
import {
  buildAnnotationEvent,
  buildTransitionEvent,
  type AnnotationRequest,
  type TransitionRequest
} from "./transitions";
import type { Application, CaseEvent } from "./types";

/**
 * The case store.
 *
 * Append-only. There is no update and no delete: `append` pushes, and every reader
 * derives what it needs from the log. A correction is a new event, so the history a
 * citizen sees is the history that actually happened.
 *
 * It is a plain module-level singleton with a subscribe/snapshot pair rather than a
 * state library, because the whole store is a few thousand objects held in memory for
 * the length of a demo, and a smaller dependency list means a smaller bundle on a slow
 * connection.
 */

export interface CaseStoreSnapshot {
  applications: ReadonlyArray<Application>;
  events: ReadonlyArray<CaseEvent>;
  eventsByApplication: ReadonlyMap<string, CaseEvent[]>;
  applicationsById: ReadonlyMap<string, Application>;
}

type Listener = () => void;

let applications: Application[] = [];
let events: CaseEvent[] = [];
let snapshot: CaseStoreSnapshot = buildSnapshot();
const listeners = new Set<Listener>();

function buildSnapshot(): CaseStoreSnapshot {
  const byApplication = new Map<string, CaseEvent[]>();
  for (const event of events) {
    const bucket = byApplication.get(event.applicationId);
    if (bucket) {
      bucket.push(event);
    } else {
      byApplication.set(event.applicationId, [event]);
    }
  }
  const byId = new Map<string, Application>();
  for (const application of applications) {
    byId.set(application.applicationId, application);
  }
  return {
    applications,
    events,
    eventsByApplication: byApplication,
    applicationsById: byId
  };
}

function commit(): void {
  snapshot = buildSnapshot();
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): CaseStoreSnapshot {
  return snapshot;
}

/** Replace the whole store. Used once at start-up with the generated dataset. */
export function seed(seedApplications: Application[], seedEvents: CaseEvent[]): void {
  applications = seedApplications.slice();
  events = seedEvents.slice();
  commit();
}

export function reset(): void {
  applications = [];
  events = [];
  commit();
}

export function getApplications(): ReadonlyArray<Application> {
  return snapshot.applications;
}

export function getApplication(applicationId: string): Application | undefined {
  return snapshot.applicationsById.get(applicationId);
}

export function getEvents(applicationId: string): CaseEvent[] {
  return snapshot.eventsByApplication.get(applicationId) ?? [];
}

export function getAllEvents(): ReadonlyArray<CaseEvent> {
  return snapshot.events;
}

export function currentStageOf(applicationId: string) {
  return deriveCurrentStage(getEvents(applicationId));
}

/**
 * Registers a new application and puts it in SUBMITTED. An application cannot exist
 * without a stage, so the record and its first event are written together.
 */
export function createApplication(application: Application, timestamp: string): CaseEvent {
  const event = buildTransitionEvent(null, {
    applicationId: application.applicationId,
    toStage: INITIAL_STAGE,
    actorRole: "APPLICANT",
    actorId: application.applicationId,
    timestamp
  });
  applications = applications.concat(application);
  events = events.concat(event);
  commit();
  return event;
}

/**
 * Moves a case. Throws TransitionError when the move is not legal or when a required
 * reason code is missing — callers are expected to let that surface, not swallow it.
 */
export function transition(request: TransitionRequest): CaseEvent {
  const current = deriveCurrentStage(getEvents(request.applicationId));
  const event = buildTransitionEvent(current, request);
  events = events.concat(event);
  commit();
  return event;
}

/** Records something that does not move the case. */
export function annotate(request: AnnotationRequest): CaseEvent {
  const event = buildAnnotationEvent(request);
  events = events.concat(event);
  commit();
  return event;
}

/** Attaches a replacement document to an application, in place of the faulty one. */
export function replaceDocument(
  applicationId: string,
  docType: Application["documents"][number]["docType"],
  filename: string,
  timestamp: string
): void {
  applications = applications.map((application) => {
    if (application.applicationId !== applicationId) return application;
    const existingIndex = application.documents.findIndex(
      (document) => document.docType === docType
    );
    const replacement = {
      docType,
      filename,
      uploadedAt: timestamp,
      status: "PROVIDED" as const
    };
    const documents =
      existingIndex === -1
        ? application.documents.concat(replacement)
        : application.documents.map((document, index) =>
            index === existingIndex ? replacement : document
          );
    return { ...application, documents };
  });
  commit();
}
