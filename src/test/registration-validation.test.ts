import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/lib/registration-validation";

const fields = { name: "Assessor", staffId: "TT1234", email: "assessor@example.com" };
describe("mandatory matching registration passwords", () => {
  it("rejects missing passwords", () => {
    expect(registrationSchema.safeParse({ ...fields, password: "", confirmPassword: "" }).success).toBe(false);
  });
  it("rejects a mismatched confirmation", () => {
    expect(registrationSchema.safeParse({ ...fields, password: "one-password", confirmPassword: "different" }).success).toBe(false);
  });
  it("accepts matching passwords", () => {
    expect(registrationSchema.safeParse({ ...fields, password: "matching", confirmPassword: "matching" }).success).toBe(true);
  });
});