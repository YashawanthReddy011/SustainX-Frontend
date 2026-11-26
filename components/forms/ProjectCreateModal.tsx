"use client";

import { FormEvent, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { Project } from "../../types";
import { createProject, getApiError } from "../../services/platform.service";
import { api } from "../../lib/api";
import ModalShell from "./ModalShell";

const categories = ["Environment", "Education", "Community", "Health", "Technology", "Agriculture", "Other"] as const;

export default function ProjectCreateModal({ onClose, onCreated, initialSdgId }: { onClose: () => void; onCreated: (project: Project) => void; initialSdgId?: number }) {
	const [form, setForm] = useState({
		title: "", description: "", objectives: "", category: "Environment" as typeof categories[number],
		sdgNumbers: [initialSdgId && initialSdgId >= 1 && initialSdgId <= 17 ? initialSdgId : 15],
		location: "", imageUrl: "", startDate: toLocalInput(new Date(Date.now() + 86_400_000)),
		endDate: toLocalInput(new Date(Date.now() + 90 * 86_400_000)), visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
	});
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	function toggleSdg(number: number) {
		setForm((current) => ({ ...current, sdgNumbers: current.sdgNumbers.includes(number) ? current.sdgNumbers.filter((value) => value !== number) : [...current.sdgNumbers, number].sort((a, b) => a - b) }));
	}

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true); setError("");
		try {
			if (!form.sdgNumbers.length) throw new Error("Select at least one SDG.");
			if (new Date(form.startDate) >= new Date(form.endDate)) throw new Error("The end date must be later than the start date.");
			let imageUrl = form.imageUrl.trim();
			if (imageFile) {
				const body = new FormData(); body.append("file", imageFile);
				const upload = await api.post("/media", body, { headers: { "Content-Type": "multipart/form-data" } });
				imageUrl = upload.data.media.url;
			}
			const project = await createProject({
				title: form.title.trim(), description: form.description.trim(),
				objectives: form.objectives.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
				category: form.category, sdgNumbers: form.sdgNumbers, location: form.location.trim(), imageUrl,
				startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(), visibility: form.visibility,
			});
			onCreated(project); onClose();
		} catch (cause) { setError(getApiError(cause, "Unable to submit the project. Sign in and try again.")); }
		finally { setLoading(false); }
	}

	return <ModalShell title="Propose an impact project" onClose={onClose}>
		<form onSubmit={submit} className="max-h-[78vh] space-y-4 overflow-y-auto pr-1">
			<p className="rounded-xl bg-[#f1f8f3] p-3 text-xs leading-5 text-[#52655a]">New projects are saved as pending and appear publicly after admin review. The owner is added to the project team automatically.</p>
			<Field label="Project name"><input required minLength={3} maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="e.g. Restore our campus garden" /></Field>
			<Field label="Description"><textarea required minLength={10} maxLength={5000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`${inputClass} h-auto py-3`} placeholder="Describe the need, approach and expected community benefit" /></Field>
			<Field label="Objectives (one per line)"><textarea maxLength={2500} rows={3} value={form.objectives} onChange={(event) => setForm({ ...form, objectives: event.target.value })} className={`${inputClass} h-auto py-3`} placeholder="Plant native species&#10;Organize monthly care sessions" /></Field>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Category"><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as typeof categories[number] })} className={inputClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select></Field>
				<Field label="Visibility"><select value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value as "PUBLIC" | "PRIVATE" })} className={inputClass}><option value="PUBLIC">Public after approval</option><option value="PRIVATE">Private team workspace</option></select></Field>
			</div>
			<fieldset><legend className="mb-2 text-sm font-bold text-[#405349]">Related SDGs</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{Array.from({ length: 17 }, (_, index) => index + 1).map((number) => <label key={number} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold ${form.sdgNumbers.includes(number) ? "border-[#78ad84] bg-[#edf7f0] text-[#0f5132]" : "border-[#d9e5dc] text-[#66766d]"}`}><input type="checkbox" checked={form.sdgNumbers.includes(number)} onChange={() => toggleSdg(number)} className="accent-[#0f5132]" />SDG {number}</label>)}</div></fieldset>
			<div className="grid gap-4 sm:grid-cols-2"><Field label="Start date"><input required type="datetime-local" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className={inputClass} /></Field><Field label="End date"><input required type="datetime-local" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className={inputClass} /></Field></div>
			<div className="grid gap-4 sm:grid-cols-2"><Field label="Location (optional)"><input maxLength={200} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className={inputClass} placeholder="City, campus or region" /></Field><Field label="Cover image URL (optional)"><input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className={inputClass} placeholder="https://..." /></Field></div>
			<label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-[#405349]"><ImagePlus size={16} />Upload cover image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="block min-w-0 text-xs" /></label>
			{imageFile && <button type="button" onClick={() => setImageFile(null)} className="inline-flex items-center gap-1 text-xs text-[#68776f]"><X size={13} />Remove {imageFile.name}</button>}
			{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
			<div className="flex justify-end gap-3 border-t border-[#e7eee9] pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button disabled={loading} className="btn-primary">{loading ? "Submitting..." : "Submit for review"}</button></div>
		</form>
	</ModalShell>;
}

const inputClass = "h-11 w-full rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm outline-none focus:border-[#78ad84]";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-[#405349]"><span className="mb-2 block">{label}</span>{children}</label>; }
function toLocalInput(date: Date) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16); }
