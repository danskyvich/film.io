import { getUser } from "@/app/lib/auth/get-user";
import { sql } from "@/app/lib/db";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function DashboardLayout({children, modal}: {children: React.ReactNode, modal: React.ReactNode}) {

  const user_id = (await getUser()).user?.sub;

  if (user_id) {
    const [row] = await sql`
    SELECT onboarded_at, onboarded_step FROM users
    WHERE user_id = ${user_id}
  `;

    if (row && !row.onboarded_at) {
      const path =
        row.onboarded_step === "3"
          ? "/onboarding/film-step"
          : "/onboarding/genre-step";
      redirect(path);
    }
  }

    return (
      <>
        <Suspense>{children}</Suspense>
        <Suspense> {modal}</Suspense>
      </>
    );
}