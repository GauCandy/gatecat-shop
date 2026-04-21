import { Suspense } from "react";
import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE } from "@/lib/session";
import { listCategories } from "@/lib/categories";
import { getCartCount } from "@/lib/cart";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const [user, categories] = await Promise.all([
    getSessionUser(token),
    listCategories(),
  ]);
  const cartCount = user ? await getCartCount(user.id) : 0;
  return (
    <Suspense fallback={null}>
      <HeaderClient user={user} categories={categories} cartCount={cartCount} />
    </Suspense>
  );
}
