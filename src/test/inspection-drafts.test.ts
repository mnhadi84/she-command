import { beforeEach, describe, expect, it, vi } from "vitest";
import { DRAFTS_KEY, saveDraft, readDrafts, deleteDraft, type InspectionSnapshot } from "@/lib/inspection-drafts";

const snapshot: InspectionSnapshot = {
  projectName: "Bukit Jelutong Warehouse", assessorName: "Assessor Hadi",
  statuses: { height: "safe", electrical: "unsafe" }, details: { electrical: { severity: "High", description: "Exposed cable", assignTo: "Site Engineer" } },
  evidencePhotos: { electrical: "data:image/jpeg;base64,YWJj" },
  eiaValues: { noise: "80" }, esgValues: { sourceCert: "", disposalChain: "", dieselEfficiency: "12", energySaver: "", renewableWaterRatio: "5", municipalWater: "6", co2Impact: "7", machineryHours: "8", solarOffset: "9", fiberRecycling: "10", batteryReclaim: "11" },
  workZone: "", noiseSiteType: "roadside", manholeType: "entry", gas: { o2: "20.9" }, heightAsset: "pole", ambientTemp: "38", tempSource: "manual", humidity: 70,
  plantChecks: { operator: true, dailyLog: false, safetyDevices: true },
  wah: { harness: true, equipment: "ladder", ladder: { structure: true, setup: false, contact: true }, mewp: { pma: false, operator: false, preop: false, restraint: false }, pmaNo: "PMA123" },
  hotWork: { type: "welding", checks: { extinguisher: true, clearance: false, ppe: true, permit: false } },
};
beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
describe("saved inspection drafts", () => {
  it("persists every field and photo with project, assessor and timestamp", () => {
    saveDraft(snapshot, ["height", "electrical"], new Date("2026-10-20T01:30:00Z"));
    const [draft] = readDrafts();
    expect(draft.snapshot).toEqual(snapshot);
    expect(draft.savedAt).toBe("2026-10-20T01:30:00.000Z");
    expect(draft.verified).toBe(1); expect(draft.total).toBe(2);
  });
  it("saves unfinished unsafe details rather than blocking drafts", () => {
    saveDraft({ ...snapshot, details: { electrical: { severity: "", description: "", assignTo: "" } } }, ["height", "electrical"]);
    expect(readDrafts()[0].snapshot.details.electrical.description).toBe("");
  });
  it("keeps multiple snapshots and deletes only the selected draft", () => {
    const first = saveDraft(snapshot, ["height"])[0];
    saveDraft({ ...snapshot, projectName: "Central Region OSP" }, ["height"]);
    deleteDraft(first.id);
    expect(readDrafts()).toHaveLength(1);
    expect(readDrafts()[0].snapshot.projectName).toBe("Central Region OSP");
  });
  it("rejects invalid stored photo URLs without overwriting drafts", () => {
    saveDraft(snapshot, ["height"]);
    const before = localStorage.getItem(DRAFTS_KEY);
    expect(() => saveDraft({ ...snapshot, evidencePhotos: { electrical: "javascript:alert(1)" } }, [])).toThrow();
    expect(localStorage.getItem(DRAFTS_KEY)).toBe(before);
  });
  it("preserves existing drafts when the device runs out of storage", () => {
    saveDraft(snapshot, ["height"]);
    const before = localStorage.getItem(DRAFTS_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    expect(() => saveDraft(snapshot, [])).toThrow();
    expect(localStorage.getItem(DRAFTS_KEY)).toBe(before);
  });
});