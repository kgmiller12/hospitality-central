"use client";

import { useActionState } from "react";
import { createJob } from "@/lib/actions";
import { CATEGORIES, US_STATES } from "@/lib/constants";
import SubmitButton from "../SubmitButton";

export default function JobForm({ defaultCompany }: { defaultCompany?: string }) {
  const [state, action] = useActionState(createJob, undefined);
  return (
    <form action={action} className="card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="title">Job title</label>
          <input className="input" id="title" name="title" required />
        </div>
        <div>
          <label className="label" htmlFor="company">Property / business name</label>
          <input className="input" id="company" name="company" defaultValue={defaultCompany} required />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="category">Department</label>
        <select className="input" id="category" name="category" required defaultValue="">
          <option value="" disabled>Choose one</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea className="input min-h-32" id="description" name="description" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="city">City</label>
          <input className="input" id="city" name="city" required />
        </div>
        <div>
          <label className="label" htmlFor="state">State</label>
          <select className="input" id="state" name="state" required defaultValue="">
            <option value="" disabled>Choose a state</option>
            {Object.entries(US_STATES).map(([code, s]) => <option key={code} value={code}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="applyUrl">Link to the job application</label>
        <input className="input" id="applyUrl" name="applyUrl" type="url" placeholder="https://" required />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton className="btn-primary w-full" pendingText="Posting…">Post job</SubmitButton>
    </form>
  );
}
