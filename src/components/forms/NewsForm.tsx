"use client";

import { useActionState } from "react";
import { createNews } from "@/lib/actions";
import ImageInput from "../ImageInput";
import SubmitButton from "../SubmitButton";

export default function NewsForm() {
  const [state, action] = useActionState(createNews, undefined);
  return (
    <form action={action} className="card space-y-4">
      <div>
        <label className="label" htmlFor="title">Headline</label>
        <input className="input" id="title" name="title" required />
      </div>
      <div>
        <label className="label" htmlFor="body">Story</label>
        <textarea className="input min-h-40" id="body" name="body" required />
      </div>
      <div>
        <label className="label" htmlFor="sourceUrl">Link for more info <span className="font-normal text-stone-400">(optional)</span></label>
        <input className="input" id="sourceUrl" name="sourceUrl" type="url" placeholder="https://" />
      </div>
      <ImageInput name="image" label="Add a photo" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton className="btn-primary w-full" pendingText="Publishing…">Publish news</SubmitButton>
    </form>
  );
}
