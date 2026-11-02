import { requireUser } from "@/lib/auth";
import { updateProfile } from "@/lib/actions";
import { CATEGORIES, SCHOOLS } from "@/lib/constants";
import ImageInput from "@/components/ImageInput";
import SubmitButton from "@/components/SubmitButton";

export default async function EditProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const me = await requireUser();
  const { welcome } = await searchParams;
  const interests = new Set((me.interests ?? "").split(","));
  const field = (name: keyof typeof me, label: string, placeholder = "") => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input className="input" id={name} name={name} defaultValue={(me[name] as string) ?? ""} placeholder={placeholder} />
    </div>
  );
  const area = (name: keyof typeof me, label: string, placeholder = "") => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <textarea className="input min-h-24" id={name} name={name} defaultValue={(me[name] as string) ?? ""} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {welcome && (
        <div className="card mb-5 border-gold bg-gold-light">
          <p className="font-semibold text-navy">Welcome to Hospitality Central, {me.name.split(" ")[0]}! 🎉</p>
          <p className="text-sm text-stone-700">Finish your profile so the AI Matchmaker can recommend the right people for you.</p>
        </div>
      )}
      <h1 className="mb-5 font-serif text-3xl font-bold text-navy">Edit profile</h1>
      <form action={updateProfile} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-navy">Basics</h2>
          <div>
            <p className="label">Profile picture</p>
            <ImageInput name="avatar" label="Choose photo" maxSize={300} initial={me.avatar} />
          </div>
          {field("name", "Name")}
          {field("headline", "Headline", "e.g. Front Office Manager | Penn State SHM '25")}
          {area("bio", "Bio", "Tell people about yourself and what you love about hospitality.")}
          {field("location", "Location", "City, State")}
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-navy">Work & school</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("currentJob", "Current job title")}
            {field("currentEmployer", "Current employer")}
          </div>
          <div>
            <label className="label" htmlFor="school">School attending or attended</label>
            <input className="input" id="school" name="school" list="schools" defaultValue={me.school ?? ""} />
            <datalist id="schools">{SCHOOLS.map((s) => <option key={s} value={s} />)}</datalist>
          </div>
          {area("experience", "Previous experience", "One role per line, e.g. Server, Allen Street Grill (2022-2023)")}
          {area("certifications", "Certifications", "One per line, e.g. ServSafe Manager")}
          <div>
            <p className="label">Areas of interest</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <label key={c} className="chip flex cursor-pointer items-center gap-1.5 border-stone-300 has-checked:border-navy has-checked:bg-navy has-checked:text-white">
                  <input type="checkbox" name="interests" value={c} defaultChecked={interests.has(c)} className="hidden" />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-navy">Contact information</h2>
          <p className="text-sm text-stone-500">🔒 Only Premium members can see this.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("contactEmail", "Contact email")}
            {field("phone", "Phone")}
          </div>
          {field("linkedin", "LinkedIn URL", "https://linkedin.com/in/…")}
        </div>

        <SubmitButton className="btn-primary w-full py-3">Save profile</SubmitButton>
      </form>
    </div>
  );
}
