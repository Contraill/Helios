import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  NASA_API_KEY: z
    .string()
    .min(1, "must be a non-empty string when set")
    .optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class EnvValidationError extends Error {
  constructor(issues: readonly string[]) {
    super(
      [
        "Invalid server environment:",
        ...issues.map((issue) => `  - ${issue}`),
      ].join("\n"),
    );
    this.name = "EnvValidationError";
  }
}

const FORBIDDEN_PUBLIC_KEYS = ["NEXT_PUBLIC_NASA_API_KEY"] as const;

export function parseServerEnv(
  raw: Record<string, string | undefined>,
): ServerEnv {
  const issues: string[] = [];
  for (const key of FORBIDDEN_PUBLIC_KEYS) {
    if (raw[key] !== undefined) {
      issues.push(`${key}: must not be defined; use NASA_API_KEY instead`);
    }
  }
  const result = serverEnvSchema.safeParse(raw);
  if (!result.success) {
    issues.push(
      ...result.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      ),
    );
  }
  if (!result.success || issues.length > 0)
    throw new EnvValidationError(issues);
  return result.data;
}
