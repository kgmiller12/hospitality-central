import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryFilter({
  basePath,
  active,
  params = {},
}: {
  basePath: string;
  active?: string;
  params?: Record<string, string | undefined>;
}) {
  const href = (category?: string) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (category) q.set("category", category);
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const cls = (on: boolean) => `chip ${on ? "border-navy bg-navy text-white" : "border-stone-300 bg-white text-stone-700 hover:border-navy"}`;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Link href={href()} className={cls(!active)}>All</Link>
      {CATEGORIES.map((c) => (
        <Link key={c} href={href(c)} className={cls(active === c)}>{c}</Link>
      ))}
    </div>
  );
}
