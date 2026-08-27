import { getReasonCode, isReasonCodeKey } from "./reasonCodes";
import { stageEvents } from "./projections";
import type { Application, CaseEvent, StageKey } from "./types";

/**
 * Queue position.
 *
 * The rule from the design: if the fault was administrative — something the office
 * could have flagged earlier, or its own error — the applicant keeps their place in
 * the queue when they resubmit. Only a genuine applicant-side failure sends them to
 * the back. Going to the back of a 253-day queue for a blurry photocopy is the kind of
 * quiet punishment that makes people give up entirely, so the default is preservation
 * and the exception has to be named in the reason code.
 *
 * The anchor is the timestamp the queue is sorted by. Preserving a place means keeping
 * the old anchor; losing it means the anchor moves to the resubmission.
 */
export function queueAnchorAt(application: Application, events: CaseEvent[]): string {
  const moves = stageEvents(events);
  let anchor = application.createdAt;
  let pendingReset = false;

  for (const event of moves) {
    if (event.toStage === "RETURNED_FOR_DOCUMENT") {
      const key = event.reasonCode;
      const preserves =
        key !== null && isReasonCodeKey(key) ? getReasonCode(key).preservesQueuePosition : true;
      pendingReset = !preserves;
      continue;
    }
    if (pendingReset && event.fromStage === "RETURNED_FOR_DOCUMENT") {
      anchor = event.timestamp;
      pendingReset = false;
    }
  }

  return anchor;
}

export interface QueueEntry {
  applicationId: string;
  district: string;
  stage: StageKey;
  anchorAt: string;
}

/**
 * Where this case sits among the cases waiting at the same desk, in the same district.
 * One-based, so it reads as "3rd of 41" rather than "index 2".
 */
export function queuePosition(
  entry: QueueEntry,
  allEntries: QueueEntry[]
): { position: number; total: number } {
  const peers = allEntries
    .filter((other) => other.district === entry.district && other.stage === entry.stage)
    .sort((a, b) => a.anchorAt.localeCompare(b.anchorAt) || a.applicationId.localeCompare(b.applicationId));

  const index = peers.findIndex((other) => other.applicationId === entry.applicationId);
  return { position: index === -1 ? peers.length + 1 : index + 1, total: peers.length };
}
