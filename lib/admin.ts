import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, SESSION_COOKIE, type SessionUser } from "./session";

export async function requireAdmin(): Promise<SessionUser> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function isAdminRequest(
  token: string | undefined
): Promise<SessionUser | null> {
  const user = await getSessionUser(token);
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
