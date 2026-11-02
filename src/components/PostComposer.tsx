import { createPost } from "@/lib/actions";
import { CATEGORIES } from "@/lib/constants";
import ImageInput from "./ImageInput";
import SubmitButton from "./SubmitButton";

export default function PostComposer({ school }: { school?: string | null }) {
  return (
    <form action={createPost} className="card space-y-3">
      <textarea
        name="content"
        className="input min-h-24"
        placeholder="Share an accomplishment, promotion, certification or update…"
        required
        maxLength={3000}
      />
      <div className="flex flex-wrap items-center gap-3">
        <ImageInput name="image" />
        <select name="category" className="input w-auto" defaultValue="">
          <option value="">Category (optional)</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <SubmitButton className="btn-primary ml-auto" pendingText="Posting…">Post</SubmitButton>
      </div>
      {school && <p className="text-xs text-stone-500">Your post will also appear on the 🎓 {school} page.</p>}
    </form>
  );
}
