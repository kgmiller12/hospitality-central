import Link from "next/link";
import SignupForm from "@/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="card">
        <h1 className="font-serif text-2xl font-bold text-navy">Join Hospitality Central</h1>
        <p className="mb-6 text-sm text-stone-600">Free forever. Upgrade any time to message members and see contact info.</p>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-stone-600">
          Already a member? <Link href="/login" className="font-semibold text-navy underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
