import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE } from "@/lib/session";
import { listCategories } from "@/lib/categories";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const [user, categories] = await Promise.all([
    getSessionUser(token),
    listCategories(),
  ]);
  return <HeaderClient user={user} categories={categories} />;
}
