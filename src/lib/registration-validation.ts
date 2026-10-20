import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  staffId: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(1, "Password is required").max(128),
  confirmPassword: z.string().min(1, "Confirm your password").max(128),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match", path: ["confirmPassword"],
});