import { sendFriendRequest, acceptFriendRequest, removeFriend } from "@/lib/actions";
import type { FriendStatus } from "@/lib/queries";

export default function FriendButton({ userId, status, small }: { userId: number; status: FriendStatus; small?: boolean }) {
  const size = small ? "px-3 py-1 text-xs" : "";
  if (status === "self") return null;
  if (status === "friends")
    return (
      <form action={removeFriend.bind(null, userId)}>
        <button className={`btn-outline ${size}`} title="Click to remove friend">✓ Friends</button>
      </form>
    );
  if (status === "sent") return <span className={`btn-outline cursor-default opacity-70 ${size}`}>Request sent</span>;
  if (status === "received")
    return (
      <form action={acceptFriendRequest.bind(null, userId)}>
        <button className={`btn-gold ${size}`}>Accept request</button>
      </form>
    );
  return (
    <form action={sendFriendRequest.bind(null, userId)}>
      <button className={`btn-primary ${size}`}>+ Add friend</button>
    </form>
  );
}
