"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { Project } from "../../types";
import { createProject, getApiError } from "../../services/platform.service";
import ModalShell from "./ModalShell";

export default function ProjectCreateModal({ onClose, onCreated, initialSdgId }: { onClose: () => void; onCreated: (project: Project) => void; initialSdgId?: number }) {
	const [form, setForm] = useState({ title: "", description: "", sdgId: String(initialSdgId && initialSdgId >= 1 && initialSdgId <= 17 ? initialSdgId : 13), location: "", imageUrl: "" });
	const [loading, setLoading] = useState(false); const [error, setError] = useState("");
	async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); try { const project = await createProject({ ...form, sdgId: Number(form.sdgId) }); onCreated(project); onClose(); } catch (e) { setError(getApiError(e, "Unable to create project. Sign in and try again.")); } finally { setLoading(false); } }
	return <ModalShell title="Create an impact project" onClose={onClose}><form onSubmit={submit} className="space-y-4">
		<Field label="Project name"><input required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} /></Field>
		<Field label="Description"><textarea required minLength={10} maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-auto py-3`} /></Field>
		<div className="grid gap-4 sm:grid-cols-2"><Field label="SDG"><select value={form.sdgId} onChange={(e) => setForm({ ...form, sdgId: e.target.value })} className={inputClass}>{Array.from({ length: 17 }, (_, i) => <option key={i + 1} value={i + 1}>SDG {i + 1}</option>)}</select></Field><Field label="Location (optional)"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} maxLength={180} /></Field></div>
		<Field label="Image URL (optional)"><input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputClass} placeholder="https://..." /></Field>
		{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}{error.includes("Authentication") && <> <Link className="font-bold underline" href="/login">Sign in</Link></>}</p>}
		<div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button disabled={loading} className="btn-primary">{loading ? "Creating..." : "Create project"}</button></div>
	</form></ModalShell>;
}

const inputClass = "h-11 w-full rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm outline-none focus:border-[#78ad84]";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-[#405349]"><span className="mb-2 block">{label}</span>{children}</label>; }
