"use client";

import { useState, useTransition } from "react";
import { getAiMatches } from "@/lib/ai-actions";
import PersonCard from "./PersonCard";

type Result = Awaited<ReturnType<typeof getAiMatches>>;

export default function AiMatches({ premium }: { premium: boolean }) {
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<number | null>(null);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold">✨ AI Connection Matchmaker</h2>
          <p className="mt-1 max-w-xl text-sm text-stone-300">
            Our AI reads your profile and the community to find the people most worth meeting, explains why, and drafts an intro you can send.
          </p>
        </div>
        <button className="btn-gold" disabled={pending} onClick={() => start(async () => setResult(await getAiMatches()))}>
          {pending ? "Finding your matches…" : result ? "Refresh matches" : "Find my best connections"}
        </button>
      </div>

      {result && "error" in result && <p className="mt-4 rounded-lg bg-white/10 p-3 text-sm">{result.error}</p>}
      {result && "matches" in result && (
        <div className="mt-5 grid gap-4 text-stone-800 sm:grid-cols-2 lg:grid-cols-3">
          {result.matches.map((m) => (
            <PersonCard key={m.id} person={m} status={m.status} premium={premium}>
              {m.intro && (
                <div className="mt-3 rounded-lg bg-cream p-3 text-xs text-stone-700">
                  <p className="mb-1 font-semibold text-navy">Suggested intro</p>
                  <p>{m.intro}</p>
                  <button
                    className="mt-2 font-semibold text-navy underline"
                    onClick={() => {
                      navigator.clipboard.writeText(m.intro!);
                      setCopied(m.id);
                    }}
                  >
                    {copied === m.id ? "Copied!" : "Copy intro"}
                  </button>
                </div>
              )}
            </PersonCard>
          ))}
        </div>
      )}
    </section>
  );
}
