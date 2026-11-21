import { redirect } from "next/navigation";
import { requireUserSession } from "@/app/proxy";

export default async function HomePage() {
  const session = await requireUserSession();
  if (session.role === "staff") {
    redirect("/staff");
  }
  redirect("/dashboard");
}
