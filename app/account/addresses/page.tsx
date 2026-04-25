import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { listAddresses } from "@/lib/addresses";
import { AddressBookClient } from "@/components/AddressBookClient";

export default async function AddressesPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await getSessionUser(token);
  if (!session) redirect("/login");

  const addresses = await listAddresses(session.id);

  return (
    <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-[20px] font-bold text-[var(--color-text)]">
          Sổ địa chỉ
        </h1>
        <p className="mt-1.5 text-[14px] text-[var(--color-text-dim)]">
          Quản lý các địa chỉ giao hàng của bạn.
        </p>
      </div>
      <AddressBookClient initial={addresses} />
    </div>
  );
}
