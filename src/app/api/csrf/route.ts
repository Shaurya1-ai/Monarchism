import { setCsrfCookie } from "@/lib/security/csrf";
import { jsonOk } from "@/lib/api/response";

export async function GET() {
  const token = await setCsrfCookie();
  return jsonOk({ token });
}
