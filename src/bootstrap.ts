import { getApplications, seed } from "./core/caseStore";
import { generateDataset, type PlantedDefect } from "./data/generator";

let seeded = false;
let plantedDefects: PlantedDefect[] = [];

/**
 * Fills the case store with the seeded synthetic dataset, once.
 *
 * Called from module scope in App.tsx rather than from an effect, so the first render
 * already has data and no screen has to handle a transient empty state that only exists
 * for one frame.
 */
export function ensureSeeded(): void {
  if (seeded || getApplications().length > 0) return;
  const dataset = generateDataset();
  seed(dataset.applications, dataset.events);
  plantedDefects = dataset.plantedDefects;
  seeded = true;
}

/**
 * What the generator deliberately broke, straight from the run that seeded the store.
 * The oversight screen shows this as a build aid for the Codex handoff; it is the
 * generator describing itself, not the output of any reconciliation.
 */
export function getPlantedDefects(): ReadonlyArray<PlantedDefect> {
  return plantedDefects;
}

/** Used by tests that want a fresh store between cases. */
export function resetSeeded(): void {
  seeded = false;
}
