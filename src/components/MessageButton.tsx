import Link from "next/link";

export default function MessageButton({ userId, premium, small }: { userId: number; premium: boolean; small?: boolean }) {
  const size = small ? "px-3 py-1 text-xs" : "";
  return premium ? (
    <Link href={`/messages/${userId}`} className={`btn-outline ${size}`}>💬 Message</Link>
  ) : (
    <Link href="/upgrade" className={`btn-outline ${size}`} title="Messaging is a Premium feature">🔒 Message</Link>
  );
}
