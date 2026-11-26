"use client";

import { FormEvent, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import api from "../../lib/api";
import type { CommunityReport } from "../../types";
import { createReport, getApiError } from "../../services/platform.service";

const categories = ["Waste Management", "Water & Sanitation", "Roads & Infrastructure", "Public Safety", "Environment", "Pollution", "Public Facilities", "Other"] as const;
const inputClass = "h-11 w-full rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm outline-none focus:border-[#78ad84]";

export default function ReportCreateForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (report: CommunityReport) => void }) {
	const [form, setForm] = useState({ title: "", description: "", category: "Waste Management" as typeof categories[number], location: "", latitude: "", longitude: "" });
	const [sdgNumbers, setSdgNumbers] = useState<number[]>([]);
	const [images, setImages] = useState<File[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	function toggleSdg(number: number) { setSdgNumbers((current) => current.includes(number) ? current.filter((value) => value !== number) : [...current, number].sort((a, b) => a - b)); }

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault(); setLoading(true); setError("");
		try {
			if (Boolean(form.latitude) !== Boolean(form.longitude)) throw new Error("Enter both coordinates or leave both blank.");
			if (images.length > 5 || images.some((file) => file.size > 5 * 1024 * 1024)) throw new Error("Choose up to five images, each no larger than 5 MB.");
			const imageUrls: string[] = [];
			for (const file of images) {
				const body = new FormData(); body.append("file", file);
				const upload = await api.post("/media", body, { headers: { "Content-Type": "multipart/form-data" } });
				imageUrls.push(upload.data.media.url);
			}
			const report = await createReport({
				title: form.title.trim(), description: form.description.trim(), category: form.category, location: form.location.trim(), imageUrls,
				...(form.latitude && form.longitude ? { latitude: Number(form.latitude), longitude: Number(form.longitude) } : {}),
				...(sdgNumbers.length ? { sdgNumbers } : {}),
			});
			onCreated(report);
		} catch (cause) { setError(getApiError(cause, "Unable to submit this report. Check your connection and try again.")); }
		finally { setLoading(false); }
	}

	return <form onSubmit={submit} className="space-y-5">
		<p className="rounded-xl bg-[#f1f8f3] p-4 text-sm leading-6 text-[#52655a]">Share enough detail for the community and reviewers to understand the issue. Reports are submitted for review; only authorized reviewers can mark them resolved.</p>
		<Field label="Issue title"><input required minLength={5} maxLength={140} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="e.g. Water leaking near the public library" /></Field>
		<Field label="What happened?"><textarea required minLength={10} maxLength={2000} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`${inputClass} h-auto py-3`} placeholder="Describe what you observed, when it occurs and how it affects the community." /></Field>
		<div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as typeof categories[number] })} className={inputClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select></Field><Field label="Location"><input required minLength={2} maxLength={180} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className={inputClass} placeholder="Street, landmark, city" /></Field></div>
		<fieldset><legend className="mb-2 text-sm font-bold text-[#405349]">Related SDGs (optional)</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{Array.from({ length: 17 }, (_, index) => index + 1).map((number) => <label key={number} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold ${sdgNumbers.includes(number) ? "border-[#78ad84] bg-[#edf7f0] text-[#0f5132]" : "border-[#d9e5dc] text-[#66766d]"}`}><input type="checkbox" checked={sdgNumbers.includes(number)} onChange={() => toggleSdg(number)} className="accent-[#0f5132]" />SDG {number}</label>)}</div></fieldset>
		<div><p className="mb-2 text-sm font-bold text-[#405349]">Map coordinates (optional)</p><p className="mb-3 text-xs text-[#829087]">Add latitude and longitude to place this report on the community map.</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Latitude"><input type="number" min={-90} max={90} step="any" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} className={inputClass} placeholder="12.9141" /></Field><Field label="Longitude"><input type="number" min={-180} max={180} step="any" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} className={inputClass} placeholder="74.8560" /></Field></div></div>
		<Field label="Photos (up to 5 images, 5 MB each)"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 5))} className="block w-full text-sm text-[#63736a] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e7f4e9] file:px-3 file:py-2 file:font-bold file:text-[#0f5132]" /></Field>
		{images.length > 0 && <div className="flex flex-wrap items-center gap-2">{images.map((image) => <span key={`${image.name}-${image.lastModified}`} className="inline-flex items-center gap-2 rounded-full bg-[#f1f8f3] px-3 py-1.5 text-xs text-[#52655a]">{image.name}<button type="button" onClick={() => setImages((current) => current.filter((item) => item !== image))} aria-label={`Remove ${image.name}`}><X size={13} /></button></span>)}<ImagePlus size={16} className="text-[#0f5132]" /></div>}
		{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
		<div className="flex justify-end gap-3 border-t border-[#e7eee9] pt-4"><button type="button" onClick={onCancel} className="btn-secondary">Cancel</button><button disabled={loading} className="btn-primary">{loading ? "Submitting..." : "Submit for review"}</button></div>
	</form>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-[#405349]"><span className="mb-2 block">{label}</span>{children}</label>; }
