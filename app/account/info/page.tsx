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
    <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-[20px] font-bold text-[var(--color-text)]">
          Thông tin tài khoản
        </h1>
        <p className="mt-1.5 text-[14px] text-[var(--color-text-dim)]">
          Cập nhật thông tin cá nhân của bạn.
        </p>
      </div>
      <AccountInfoForm initial={profile} />
    </div>
  );
}
