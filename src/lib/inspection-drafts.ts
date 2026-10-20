import { z } from "zod";

const text = z.string().max(10000);
const checks = z.record(z.boolean());
export const inspectionSnapshotSchema = z.object({
  projectName: z.string().max(150), assessorName: z.string().max(100),
  statuses: z.record(z.enum(["safe", "unsafe", "na"]).nullable()),
  details: z.record(z.object({ severity: text, description: text, assignTo: text })),
  evidencePhotos: z.record(z.string().max(2000000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/)),
  eiaValues: z.record(text),
  esgValues: z.object({ sourceCert: text, disposalChain: text, dieselEfficiency: text, energySaver: text, renewableWaterRatio: text, municipalWater: text, co2Impact: text, machineryHours: text, solarOffset: text, fiberRecycling: text, batteryReclaim: text }),
  workZone: z.enum(["", "OSP & Roadside Civils", "Aerial Fiber & Poles", "Underground Manhole & Chamber", "Solar Installation (TESB)", "EV Charger Hub (Charge N Go)", "Warehouse & Logistics Hub", "Substation & DC Power Room", "Building Risers & MDF"]),
  noiseSiteType: text, manholeType: text, gas: z.record(text), heightAsset: text,
  ambientTemp: text, tempSource: z.enum(["gps", "default", "manual"]), humidity: z.number().nullable(),
  plantChecks: z.object({ operator: z.boolean(), dailyLog: z.boolean(), safetyDevices: z.boolean() }),
  wah: z.object({ harness: z.boolean(), equipment: z.enum(["", "ladder", "mewp"]), ladder: z.object({ structure: z.boolean(), setup: z.boolean(), contact: z.boolean() }), mewp: z.object({ pma: z.boolean(), operator: z.boolean(), preop: z.boolean(), restraint: z.boolean() }), pmaNo: text }),
  hotWork: z.object({ type: z.enum(["", "welding", "cutting"]), checks: checks.and(z.object({ extinguisher: z.boolean(), clearance: z.boolean(), ppe: z.boolean(), permit: z.boolean() })) }),
});
// Zod infers optional object keys when this project's strictNullChecks is off;
// runtime parsing still requires every key in the snapshot schema.
type RequiredFields<T> = T extends object ? { [K in keyof T]-?: RequiredFields<T[K]> } : T;
export type InspectionSnapshot = RequiredFields<z.infer<typeof inspectionSnapshotSchema>>;
const draftSchema = z.object({
  id: z.string().uuid(), savedAt: z.string().datetime(),
  verified: z.number().int().nonnegative(), total: z.number().int().nonnegative(),
  snapshot: inspectionSnapshotSchema,
});
export type InspectionDraft = RequiredFields<z.infer<typeof draftSchema>>;
export const DRAFTS_KEY = "she-analytics-saved-drafts-v1";

export function readDrafts(): InspectionDraft[] {
  const raw = localStorage.getItem(DRAFTS_KEY);
  if (!raw) return [];
  const parsed = z.array(draftSchema).safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("Saved drafts could not be read. Existing drafts have not been changed.");
  return parsed.data as InspectionDraft[];
}
export function saveDraft(snapshot: InspectionSnapshot, categoryTitles: string[], now = new Date()): InspectionDraft[] {
  const validated = inspectionSnapshotSchema.parse(snapshot);
  const draft = draftSchema.parse({ id: crypto.randomUUID(), savedAt: now.toISOString(), verified: categoryTitles.filter((title) => validated.statuses[title] === "safe").length, total: categoryTitles.length, snapshot: validated }) as InspectionDraft;
  const drafts = [draft, ...readDrafts()];
  // A single write is atomic: quota failures leave the existing drafts intact.
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return drafts;
}
export function deleteDraft(id: string): InspectionDraft[] {
  const drafts = readDrafts().filter((draft) => draft.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return drafts;
}