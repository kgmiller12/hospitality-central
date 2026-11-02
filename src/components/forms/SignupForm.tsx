"use client";

import { useActionState, useState } from "react";
import { signup } from "@/lib/actions";
import { SCHOOLS } from "@/lib/constants";
import SubmitButton from "../SubmitButton";

export default function SignupForm() {
  const [state, action] = useActionState(signup, undefined);
  const [type, setType] = useState("individual");
  const [attended, setAttended] = useState("yes");

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          ["individual", "I'm a professional or student"],
          ["company", "I represent a company"],
        ].map(([v, l]) => (
          <label key={v} className={`chip cursor-pointer py-2 text-center text-sm ${type === v ? "border-navy bg-navy text-white" : "border-stone-300"}`}>
            <input type="radio" name="accountType" value={v} checked={type === v} onChange={() => setType(v)} className="hidden" />
            {l}
          </label>
        ))}
      </div>
      <div>
        <label className="label" htmlFor="name">{type === "company" ? "Company name" : "Full name"}</label>
        <input className="input" id="name" name="name" required />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
      </div>

      {type === "individual" ? (
        <>
          <div>
            <p className="label">Did you attend a college or university program?</p>
            <div className="flex gap-4 text-sm">
              {["yes", "no"].map((v) => (
                <label key={v} className="flex items-center gap-1.5">
                  <input type="radio" name="attended" value={v} checked={attended === v} onChange={() => setAttended(v)} />
                  {v === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
          </div>
          {attended === "yes" && (
            <div>
              <label className="label" htmlFor="school">College or university</label>
              <input className="input" id="school" name="school" list="schools" placeholder="e.g. Penn State University" />
              <datalist id="schools">{SCHOOLS.map((s) => <option key={s} value={s} />)}</datalist>
              <p className="mt-1 text-xs text-stone-500">You&apos;ll join your school&apos;s alumni page automatically.</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="currentEmployer">
                Where do you work?{attended === "yes" && <span className="font-normal text-stone-400"> (optional)</span>}
              </label>
              <input className="input" id="currentEmployer" name="currentEmployer" />
            </div>
            <div>
              <label className="label" htmlFor="currentJob">Job title <span className="font-normal text-stone-400">(optional)</span></label>
              <input className="input" id="currentJob" name="currentJob" />
            </div>
          </div>
        </>
      ) : (
        <input type="hidden" name="attended" value="no" />
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton className="btn-primary w-full" pendingText="Creating account…">Create free account</SubmitButton>
    </form>
  );
}
