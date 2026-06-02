import { clearSession } from "@/lib/auth/session";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/get-user";
import { auditLog } from "@/lib/api/audit";

export async function POST(request: Request) {
  try {
    if (!(await validateCsrf(request))) {
      return jsonError("Invalid CSRF token", 403);
    }
    const user = await getCurrentUser();
    await clearSession();
    if (user) {
      await auditLog({ userId: user.id, action: "auth.logout" });
    }
    return jsonOk({ message: "Logged out" });
  } catch (err) {
    return handleApiError(err);
  }
}
