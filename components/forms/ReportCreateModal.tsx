"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import type { CommunityReport } from "../../types";
import { createReport, getApiError } from "../../services/platform.service";
import ModalShell from "./ModalShell";

const inputClass = "h-11 w-full rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm outline-none focus:border-[#78ad84]";
export default function ReportCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (report: CommunityReport) => void }) {
	const [form, setForm] = useState({ title: "", description: "", category: "Infrastructure", location: "", latitude: "", longitude: "" });
	const [images, setImages] = useState<File[]>([]);
	const [loading, setLoading] = useState(false); const [error, setError] = useState("");
	async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); try { if (Boolean(form.latitude) !== Boolean(form.longitude)) throw new Error("Enter both coordinates or leave both blank."); if (images.length > 5 || images.some((file) => file.size > 5 * 1024 * 1024)) throw new Error("Select up to five images, each 5 MB or smaller."); const imageUrls: string[] = []; for (const file of images) { const body = new FormData(); body.append("file", file); const { data } = await api.post("/media", body, { headers: { "Content-Type": "multipart/form-data" } }); imageUrls.push(data.media.url); } const report = await createReport({ title: form.title, description: form.description, category: form.category, location: form.location, ...(form.latitude && form.longitude ? { latitude: Number(form.latitude), longitude: Number(form.longitude) } : {}), imageUrls }); onCreated(report); onClose(); } catch (e) { setError(getApiError(e, "Unable to submit the report. Sign in and try again.")); } finally { setLoading(false); } }
	return <ModalShell title="Report a community issue" onClose={onClose}><form onSubmit={submit} className="space-y-4">
		<Field label="Issue"><input required minLength={5} maxLength={140} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} /></Field>
		<Field label="Details"><textarea required minLength={10} maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-auto py-3`} /></Field>
		<div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>{["Infrastructure", "Waste Management", "Water and Sanitation", "Public Safety", "Environment", "Other"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Location"><input required minLength={2} maxLength={180} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} /></Field></div>
		<div className="grid gap-4 sm:grid-cols-2"><Field label="Latitude (optional)"><input type="number" min={-90} max={90} step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className={inputClass} placeholder="12.9141" /></Field><Field label="Longitude (optional)"><input type="number" min={-180} max={180} step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className={inputClass} placeholder="74.8560" /></Field></div>
		<Field label="Photos (up to 5 images, max 5 MB each)"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 5))} className="block w-full text-sm text-[#63736a] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e7f4e9] file:px-3 file:py-2 file:font-bold file:text-[#0f5132]" /></Field>
		{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}{error.includes("Authentication") && <> <Link className="font-bold underline" href="/login">Sign in</Link></>}</p>}
		<div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button disabled={loading} className="btn-primary">{loading ? "Submitting..." : "Submit report"}</button></div>
	</form></ModalShell>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-[#405349]"><span className="mb-2 block">{label}</span>{children}</label>; }
