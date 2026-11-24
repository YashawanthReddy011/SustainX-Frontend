"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { CommunityReport } from "../../types";
import { createReport, getApiError } from "../../services/platform.service";
import ModalShell from "./ModalShell";

const inputClass = "h-11 w-full rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm outline-none focus:border-[#78ad84]";
export default function ReportCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (report: CommunityReport) => void }) {
	const [form, setForm] = useState({ title: "", description: "", category: "Infrastructure", location: "" });
	const [loading, setLoading] = useState(false); const [error, setError] = useState("");
	async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); try { const report = await createReport(form); onCreated(report); onClose(); } catch (e) { setError(getApiError(e, "Unable to submit the report. Sign in and try again.")); } finally { setLoading(false); } }
	return <ModalShell title="Report a community issue" onClose={onClose}><form onSubmit={submit} className="space-y-4">
		<Field label="Issue"><input required minLength={5} maxLength={140} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} /></Field>
		<Field label="Details"><textarea required minLength={10} maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-auto py-3`} /></Field>
		<div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>{["Infrastructure", "Waste Management", "Water and Sanitation", "Public Safety", "Environment", "Other"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Location"><input required minLength={2} maxLength={180} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} /></Field></div>
		{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}{error.includes("Authentication") && <> <Link className="font-bold underline" href="/login">Sign in</Link></>}</p>}
		<div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button disabled={loading} className="btn-primary">{loading ? "Submitting..." : "Submit report"}</button></div>
	</form></ModalShell>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-[#405349]"><span className="mb-2 block">{label}</span>{children}</label>; }
