import Link from "next/link";
import Avatar from "./Avatar";
import FriendButton from "./FriendButton";
import MessageButton from "./MessageButton";
import type { Candidate } from "@/lib/matching";
import type { FriendStatus } from "@/lib/queries";

export default function PersonCard({
  person,
  status,
  premium,
  children,
}: {
  person: Candidate;
  status: FriendStatus;
  premium: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${person.id}`}><Avatar name={person.name} src={person.avatar} size={52} /></Link>
        <div className="min-w-0">
          <Link href={`/profile/${person.id}`} className="font-semibold text-navy hover:underline">{person.name}</Link>
          <p className="text-sm text-stone-600">{person.headline || [person.currentJob, person.currentEmployer].filter(Boolean).join(" at ")}</p>
          {person.school && <p className="text-xs text-stone-500">🎓 {person.school}</p>}
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm text-stone-700">{person.reason}</p>
      {children}
      <div className="mt-4 flex gap-2">
        <FriendButton userId={person.id} status={status} small />
        <MessageButton userId={person.id} premium={premium} small />
      </div>
    </div>
  );
}
