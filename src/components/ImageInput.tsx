"use client";

import { useState } from "react";

// Resizes the chosen picture in the browser and stores it as a small JPEG data URL
// in a hidden form field, so no separate file storage service is needed.
export default function ImageInput({
  name,
  label = "Add a picture",
  maxSize = 900,
  initial,
}: {
  name: string;
  label?: string;
  maxSize?: number;
  initial?: string | null;
}) {
  const [value, setValue] = useState(initial ?? "");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    setValue(canvas.toDataURL("image/jpeg", 0.8));
  }

  return (
    <div className="flex items-center gap-3">
      <label className="btn-outline cursor-pointer">
        📷 {label}
        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
      </label>
      <input type="hidden" name={name} value={value} />
      {value && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-12 w-12 rounded-md object-cover" />
          <button type="button" className="text-xs text-stone-500 underline" onClick={() => setValue("")}>
            Remove
          </button>
        </>
      )}
    </div>
  );
}
