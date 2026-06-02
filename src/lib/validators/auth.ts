import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
  displayName: z.string().min(2).max(32),
  hunterName: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Hunter name: letters, numbers, underscore only"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: signupSchema.shape.password,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const allocateStatsSchema = z.object({
  strength: z.number().int().min(0).max(100),
  agility: z.number().int().min(0).max(100),
  intelligence: z.number().int().min(0).max(100),
  vitality: z.number().int().min(0).max(100),
  perception: z.number().int().min(0).max(100),
});
