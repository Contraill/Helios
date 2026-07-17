import { getServerEnv } from "@/lib/env/server";

export function GET() {
  getServerEnv();
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
