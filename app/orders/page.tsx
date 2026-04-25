import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { listOrders } from "@/lib/orders";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { OrdersClient } from "@/components/OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("/login");

  const orders = await listOrders(user.id);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            breadcrumbs={[
              { href: "/", label: "Trang chủ" },
              { label: "Đơn hàng của tôi" },
            ]}
            title="Đơn hàng của tôi"
          />
          <OrdersClient orders={orders} />
        </div>
      </main>
      <Footer />
    </>
  );
}
