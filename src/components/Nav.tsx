import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import Avatar from "./Avatar";

const links = [
  { href: "/feed", label: "Connections" },
  { href: "/recommended", label: "Recommended" },
  { href: "/jobs", label: "Jobs" },
  { href: "/schools", label: "Schools" },
  { href: "/news", label: "News" },
  { href: "/messages", label: "Messages" },
];

export default async function Nav() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-[1000] border-b border-navy-light bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href={user ? "/feed" : "/"} className="font-serif text-xl font-bold whitespace-nowrap">
          Hospitality <span className="text-gold">Central</span>
        </Link>
        {user ? (
          <>
            <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-md px-3 py-1.5 whitespace-nowrap hover:bg-navy-light">
                  {l.label}
                </Link>
              ))}
            </nav>
            {!user.isPremium && (
              <Link href="/upgrade" className="btn-gold hidden py-1.5 sm:inline-flex">
                Go Premium
              </Link>
            )}
            <Link href={`/profile/${user.id}`} title="My profile">
              <Avatar name={user.name} src={user.avatar} size={34} />
            </Link>
            <form action={logout}>
              <button className="text-sm text-stone-300 hover:text-white">Log out</button>
            </form>
          </>
        ) : (
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/about" className="hidden hover:underline sm:inline">About</Link>
            <Link href="/login" className="hover:underline">Log in</Link>
            <Link href="/signup" className="btn-gold py-1.5">Join free</Link>
          </div>
        )}
      </div>
    </header>
  );
}
