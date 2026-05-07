import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { getUserProfile } from "@/lib/users";
import { AccountInfoForm } from "@/components/AccountInfoForm";

export default async function AccountInfoPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await getSessionUser(token);
  if (!session) redirect("/login");

  const profile = await getUserProfile(session.id);
  if (!profile) redirect("/login");

  return (
    <div className="relative border-2 border-zinc-700 bg-zinc-900 p-6">
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <span className="mc-rivet mc-rivet-bl" />
      <span className="mc-rivet mc-rivet-br" />

      <div className="mb-6 flex items-center justify-between border-b-2 border-zinc-800 pb-5">
        <div>
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ DOSSIER · OPERATOR INFO
          </p>
          <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight text-zinc-100 sm:text-[26px]">
            Thông tin tài khoản<span className="text-orange-500">.</span>
          </h1>
          <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            ▸ Cập nhật thông tin cá nhân của bạn.
          </p>
        </div>
        <span className="mc-mono hidden items-center gap-1.5 border-2 border-zinc-700 bg-zinc-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 [animation:mc-pulse_1.4s_ease-in-out_infinite]" />
          EDITABLE
        </span>
      </div>
      <AccountInfoForm initial={profile} />
    </div>
  );
}
