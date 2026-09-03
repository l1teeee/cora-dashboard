import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const sesion = await auth();

  if (sesion) {
    redirect("/dashboard");
  }

  redirect("/login");
}
