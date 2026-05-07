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
    <div className="relative border-2 border-zinc-700 bg-zinc-900 p-6">
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <span className="mc-rivet mc-rivet-bl" />
      <span className="mc-rivet mc-rivet-br" />

      <div className="mb-6 flex items-center justify-between border-b-2 border-zinc-800 pb-5">
        <div>
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ DEPLOY POINTS · ADDRESS BOOK
          </p>
          <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight text-zinc-100 sm:text-[26px]">
            Sổ địa chỉ<span className="text-orange-500">.</span>
          </h1>
          <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            ▸ Quản lý các địa chỉ giao hàng của bạn.
          </p>
        </div>
      </div>
      <AddressBookClient initial={addresses} />
    </div>
  );
}
