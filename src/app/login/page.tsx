import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card">
        <h1 className="font-serif text-2xl font-bold text-navy">Welcome back</h1>
        <p className="mb-6 text-sm text-stone-600">Log in to Hospitality Central.</p>
        <LoginForm next={next} />
        <p className="mt-6 text-center text-sm text-stone-600">
          New here? <Link href="/signup" className="font-semibold text-navy underline">Create a free account</Link>
        </p>
      </div>
    </div>
  );
}
