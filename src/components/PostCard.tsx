import Link from "next/link";
import Avatar from "./Avatar";
import SubmitButton from "./SubmitButton";
import { addComment, deletePost, toggleLike } from "@/lib/actions";
import { schoolSlug } from "@/lib/constants";
import { timeAgo } from "@/lib/format";
import type { FeedPost } from "@/lib/queries";

export default function PostCard({ post, viewerId }: { post: FeedPost; viewerId: number }) {
  return (
    <article className="card">
      <header className="flex items-start gap-3">
        <Link href={`/profile/${post.author.id}`}>
          <Avatar name={post.author.name} src={post.author.avatar} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${post.author.id}`} className="font-semibold text-navy hover:underline">
            {post.author.name}
          </Link>
          {post.author.headline && <p className="truncate text-xs text-stone-500">{post.author.headline}</p>}
          <p className="text-xs text-stone-400">
            {timeAgo(post.createdAt)}
            {post.author.school && (
              <>
                {" · "}
                <Link href={`/schools/${schoolSlug(post.author.school)}`} className="hover:underline">🎓 {post.author.school}</Link>
              </>
            )}
          </p>
        </div>
        {post.category && <span className="chip border-gold bg-gold-light text-navy">{post.category}</span>}
      </header>

      <p className="mt-3 whitespace-pre-wrap text-[15px]">{post.content}</p>
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="mt-3 max-h-[480px] w-full rounded-lg object-cover" />
      )}

      <div className="mt-3 flex items-center gap-4 border-t border-stone-100 pt-3 text-sm">
        <form action={toggleLike.bind(null, post.id)}>
          <button className={`font-medium ${post.likedByMe ? "text-red-600" : "text-stone-600 hover:text-red-600"}`}>
            {post.likedByMe ? "♥" : "♡"} {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
          </button>
        </form>
        <span className="text-stone-500">💬 {post.comments.length} comments</span>
        {post.authorId === viewerId && (
          <form action={deletePost.bind(null, post.id)} className="ml-auto">
            <button className="text-xs text-stone-400 hover:text-red-600">Delete</button>
          </form>
        )}
      </div>

      {post.comments.length > 0 && (
        <ul className="mt-3 space-y-2">
          {post.comments.map(({ comment, author }) => (
            <li key={comment.id} className="flex gap-2">
              <Avatar name={author.name} src={author.avatar} size={28} />
              <div className="rounded-lg bg-stone-100 px-3 py-1.5 text-sm">
                <Link href={`/profile/${author.id}`} className="font-semibold text-navy hover:underline">{author.name}</Link>{" "}
                {comment.content}
              </div>
            </li>
          ))}
        </ul>
      )}
      <form action={addComment.bind(null, post.id)} className="mt-3 flex gap-2">
        <input name="content" className="input" placeholder="Write a comment…" required maxLength={1000} />
        <SubmitButton className="btn-outline" pendingText="…">Reply</SubmitButton>
      </form>
    </article>
  );
}
