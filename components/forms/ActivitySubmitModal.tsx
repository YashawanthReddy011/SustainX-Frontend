"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import type { Activity } from "../../types";
import { createActivity, getApiError } from "../../services/platform.service";
import ModalShell from "./ModalShell";

const sdgs = ["No Poverty", "Zero Hunger", "Good Health and Well-being", "Quality Education", "Gender Equality", "Clean Water and Sanitation", "Affordable and Clean Energy", "Decent Work and Economic Growth", "Industry, Innovation and Infrastructure", "Reduced Inequalities", "Sustainable Cities and Communities", "Responsible Consumption and Production", "Climate Action", "Life Below Water", "Life on Land", "Peace, Justice and Strong Institutions", "Partnerships for the Goals"];

export default function ActivitySubmitModal({ onClose, onCreated, defaultSdgId = 13, defaultCategory, defaultChallengeId }: { onClose: () => void; onCreated: (activity: Activity) => void; defaultSdgId?: number; defaultCategory?: string; defaultChallengeId?: string }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
	const [form, setForm] = useState({ title: "", description: "", location: "", evidenceUrl: "", quantity: "1", sdgId: String(defaultSdgId), category: defaultCategory ?? "", latitude: "", longitude: "" });
	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault(); setLoading(true); setError("");
		try {
			if (Boolean(form.latitude) !== Boolean(form.longitude)) { setError("Enter both latitude and longitude, or leave both blank."); return; }
			if (defaultChallengeId && !evidenceFile && !form.evidenceUrl.trim()) { setError("Add a photo or evidence URL for this challenge submission."); return; }
			let evidenceUrl = form.evidenceUrl.trim();
			if (evidenceFile) {
				const body = new FormData(); body.append("file", evidenceFile);
				const uploaded = await api.post("/media", body, { headers: { "Content-Type": "multipart/form-data" } });
				evidenceUrl = uploaded.data.media.url;
			}
			const activity = await createActivity({ title: form.title.trim(), description: form.description.trim(), location: form.location.trim(), evidenceUrl, quantity: Number(form.quantity), sdgId: Number(form.sdgId), challengeId: defaultChallengeId, category: form.category.trim() || undefined, ...(form.latitude && form.longitude ? { latitude: Number(form.latitude), longitude: Number(form.longitude) } : {}) });
			onCreated(activity); onClose();
		} catch (submitError) { setError(getApiError(submitError, "Unable to submit the activity. Sign in and check that the backend is running.")); }
		finally { setLoading(false); }
	}
	return <ModalShell title={defaultChallengeId ? "Submit challenge evidence" : "Submit an activity"} onClose={onClose}><form onSubmit={submit} className="space-y-4">
		{defaultChallengeId && <p className="rounded-xl bg-[#f1f8f3] p-3 text-xs leading-5 text-[#52655a]">Your submission will be linked to this challenge and reviewed by an administrator. Verified evidence updates challenge progress and awards impact points.</p>}
		<Field label="Activity name"><input required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. Native tree planting" /></Field>
		<Field label="What did you do?"><textarea required minLength={10} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputClass} h-auto py-3`} placeholder="Describe the action and its impact" /></Field>
		<div className="grid gap-4 sm:grid-cols-2"><Field label="Location"><input required minLength={2} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="City, campus or area" /></Field><Field label="SDG"><select value={form.sdgId} onChange={(e) => setForm({ ...form, sdgId: e.target.value })} className={inputClass}>{sdgs.map((name, index) => <option key={name} value={index + 1}>SDG {index + 1}: {name}</option>)}</select></Field></div>
		<div className="grid gap-4 sm:grid-cols-2"><Field label="Quantity"><input type="number" required min={1} max={100000} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputClass} /></Field><Field label="Activity type (optional)"><input maxLength={80} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="Tree planting, water saving..." /></Field></div>
		<div className="grid gap-4 sm:grid-cols-2"><Field label="Latitude (optional)"><input type="number" min={-90} max={90} step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className={inputClass} placeholder="e.g. 12.9141" /></Field><Field label="Longitude (optional)"><input type="number" min={-180} max={180} step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className={inputClass} placeholder="e.g. 74.8560" /></Field></div>
		<Field label="Evidence URL (optional)"><input type="url" value={form.evidenceUrl} onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })} className={inputClass} placeholder="https://..." /></Field>
		<Field label="Or upload a photo (max 5 MB)"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)} className="block w-full text-sm text-[#63736a] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e7f4e9] file:px-3 file:py-2 file:font-bold file:text-[#0f5132]" /></Field>
		{error && <p role="alert" className="rounded-xl border border-[#f0c7ca] bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}{error.includes("Authentication") && <> <Link className="font-bold underline" href="/login">Sign in</Link></>}</p>}
		<div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">{loading ? "Submitting..." : "Submit for review"}</button></div>
	</form></ModalShell>;
}

const inputClass = "h-11 w-full rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm outline-none focus:border-[#78ad84]";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-[#405349]"><span className="mb-2 block">{label}</span>{children}</label>; }
