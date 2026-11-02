import Link from "next/link";
import { requireUser } from "@/lib/auth";
import JobForm from "@/components/forms/JobForm";

export default async function NewJobPage() {
  const me = await requireUser();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/jobs" className="text-sm text-stone-500 hover:underline">← Back to jobs</Link>
      <h1 className="mb-5 font-serif text-3xl font-bold text-navy">Post a hospitality job</h1>
      <JobForm defaultCompany={me.currentEmployer ?? ""} />
    </div>
  );
}
