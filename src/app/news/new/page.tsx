import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import NewsForm from "@/components/forms/NewsForm";

export default async function NewNewsPage() {
  const me = await requireUser();
  if (me.accountType !== "company") redirect("/news");
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/news" className="text-sm text-stone-500 hover:underline">← Back to news</Link>
      <h1 className="mb-5 font-serif text-3xl font-bold text-navy">Share company news</h1>
      <NewsForm />
    </div>
  );
}
