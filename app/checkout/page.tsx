import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { listAddresses } from "@/lib/addresses";
import { listCartItemsById } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { CheckoutClient } from "@/components/CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("/login");

  const params = await searchParams;
  const itemIds = params.items?.split(",").filter(Boolean) || [];

  if (!itemIds.length) redirect("/cart");

  const [addresses, items] = await Promise.all([
    listAddresses(user.id),
    listCartItemsById(user.id, itemIds),
  ]);

  if (!items.length) redirect("/cart");

  // items should match itemIds order
  const orderedItems = itemIds
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean) as CartItem[];

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            breadcrumbs={[
              { href: "/cart", label: "Giỏ hàng" },
              { label: "Thanh toán" },
            ]}
            title="Thanh toán"
          />
          <CheckoutClient addresses={addresses} items={orderedItems} />
        </div>
      </main>
      <Footer />
    </>
  );
}
