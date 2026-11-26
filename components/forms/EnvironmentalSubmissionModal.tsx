"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import type { EnvironmentalActivityType, EnvironmentalSubmission } from "../../types";
import { getApiError, submitEnvironmentalActivity } from "../../services/platform.service";
import ModalShell from "./ModalShell";

const config: Record<EnvironmentalActivityType, { label: string; unit: string; sdg: string; integer: boolean; beforeAfter: boolean; max: number; measurementMethod: boolean; guidance: string }> = {
	TREE_PLANTATION: { label: "Tree Plantation", unit: "trees planted", sdg: "15", integer: true, beforeAfter: true, max: 1000, measurementMethod: false, guidance: "Count only newly planted trees. Maintenance of previously reported trees is not a new planting. Combine same-day planting at one location into a single submission." },
	TREE_SURVIVAL: { label: "Tree Survival", unit: "trees surviving", sdg: "15", integer: true, beforeAfter: false, max: 1000, measurementMethod: false, guidance: "Count planted trees confirmed alive in this follow-up. Include the survey date and site; do not count the same trees twice in one follow-up." },
	WATER_CONSERVATION: { label: "Water Conservation", unit: "litres saved", sdg: "6", integer: false, beforeAfter: false, max: 1000000, measurementMethod: true, guidance: "Describe the measurement method and reporting period; provide evidence for the estimate. Submit one combined claim per location each day." },
	RENEWABLE_ENERGY: { label: "Renewable Energy", unit: "kWh generated or saved", sdg: "7", integer: false, beforeAfter: false, max: 1000000, measurementMethod: true, guidance: "Report energy for a specific meter or reporting period and explain how the kWh value was measured." },
	WASTE_REDUCTION: { label: "Waste Reduction", unit: "kilograms diverted", sdg: "12", integer: false, beforeAfter: true, max: 100000, measurementMethod: true, guidance: "Report measured waste diverted or prevented for this event only; do not include previously reported totals. Combine same-day work at one location into one submission." },
	CLIMATE_ACTION: { label: "Climate Action", unit: "verified actions", sdg: "13", integer: true, beforeAfter: false, max: 1000, measurementMethod: false, guidance: "Describe the climate action and attach evidence that shows this specific activity took place." },
	MARINE_PROTECTION: { label: "Marine Protection", unit: "verified actions", sdg: "14", integer: true, beforeAfter: false, max: 1000, measurementMethod: false, guidance: "Describe the marine or coastal protection activity and attach evidence for this specific action." },
	BIODIVERSITY: { label: "Biodiversity", unit: "species observations", sdg: "15", integer: true, beforeAfter: false, max: 100, measurementMethod: false, guidance: "Count distinct species observed in this survey. Enter species names and attach a supporting image. List each species only once per survey." },
};

const inputClass = "h-11 w-full rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm outline-none focus:border-[#78ad84]";

export default function EnvironmentalSubmissionModal({ type, onClose, onCreated }: {
	type: EnvironmentalActivityType;
	onClose: () => void;
	onCreated: (submission: EnvironmentalSubmission) => void;
}) {
	const details = config[type];
	const [form, setForm] = useState({ title: "", description: "", location: "", activityDate: localDate(), quantity: "1", speciesName: "", measurementMethod: "" });
	const [beforeImage, setBeforeImage] = useState<File | null>(null);
	const [afterImage, setAfterImage] = useState<File | null>(null);
	const [evidenceImage, setEvidenceImage] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function upload(file: File) {
		const body = new FormData();
		body.append("file", file);
		const { data } = await api.post("/media", body, { headers: { "Content-Type": "multipart/form-data" } });
		return String(data.media.url);
	}

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError("");
		try {
			const files = [beforeImage, afterImage, evidenceImage].filter((file): file is File => Boolean(file));
			if (files.some((file) => file.size > 5 * 1024 * 1024)) throw new Error("Each image must be 5 MB or smaller.");
			if (details.beforeAfter && (!beforeImage || !afterImage)) throw new Error("Both before and after images are required for this activity.");
			if (!details.beforeAfter && !evidenceImage) throw new Error("Add at least one evidence photo.");
			const beforeImageUrl = beforeImage ? await upload(beforeImage) : undefined;
			const afterImageUrl = afterImage ? await upload(afterImage) : undefined;
			const evidenceUrls = details.beforeAfter
				? [beforeImageUrl, afterImageUrl].filter((url): url is string => Boolean(url))
				: evidenceImage ? [await upload(evidenceImage)] : [];
			const submission = await submitEnvironmentalActivity({
				idempotencyKey: crypto.randomUUID(),
				type,
				title: form.title.trim(),
				description: form.description.trim(),
				location: form.location.trim(),
				activityDate: form.activityDate,
				quantity: Number(form.quantity),
				...(details.measurementMethod ? { measurementMethod: form.measurementMethod.trim() } : {}),
				...(type === "BIODIVERSITY" ? { speciesName: form.speciesName.trim() } : {}),
				evidenceUrls,
				...(beforeImageUrl ? { beforeImageUrl } : {}),
				...(afterImageUrl ? { afterImageUrl } : {}),
			});
			onCreated(submission);
			onClose();
		} catch (submitError) {
			setError(getApiError(submitError, "Unable to submit environmental activity."));
		} finally {
			setLoading(false);
		}
	}

	return <ModalShell title={`Submit ${details.label.toLowerCase()}`} onClose={onClose}>
		<form onSubmit={submit} className="space-y-4">
			<div className="rounded-xl bg-[#f1f8f3] p-4 text-xs leading-5 text-[#52655a]">
				<p className="font-extrabold text-[#0f5132]">Verification rules · SDG {details.sdg}</p>
				<p className="mt-1">{details.guidance} Only approved submissions enter verified impact totals.</p>
			</div>
			<Field label="Activity title"><input required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} /></Field>
			<Field label="What happened?"><textarea required minLength={20} maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-auto py-3`} /></Field>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Location"><input required minLength={2} maxLength={180} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} /></Field>
				<Field label="Activity date"><input type="date" required max={localDate()} value={form.activityDate} onChange={(e) => setForm({ ...form, activityDate: e.target.value })} className={inputClass} /></Field>
				<Field label={`Verified unit (${details.unit})`}><input type="number" required min="0.01" max={details.max} step={details.integer ? "1" : "any"} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputClass} /></Field>
			</div>
			{type === "BIODIVERSITY" && <Field label="Observed species names"><input required minLength={2} maxLength={200} value={form.speciesName} onChange={(e) => setForm({ ...form, speciesName: e.target.value })} className={inputClass} placeholder="Names separated by commas" /></Field>}
			{details.measurementMethod && <Field label="Measurement method"><textarea required minLength={10} maxLength={500} rows={3} value={form.measurementMethod} onChange={(e) => setForm({ ...form, measurementMethod: e.target.value })} className={`${inputClass} h-auto py-3`} placeholder="Explain the measurement, amount and reporting period." /></Field>}
			{details.beforeAfter ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Before photo (max 5 MB)"><input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setBeforeImage(e.target.files?.[0] ?? null)} className="block w-full text-xs" /></Field><Field label="After photo (max 5 MB)"><input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setAfterImage(e.target.files?.[0] ?? null)} className="block w-full text-xs" /></Field></div> : <Field label="Evidence photo (max 5 MB)"><input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setEvidenceImage(e.target.files?.[0] ?? null)} className="block w-full text-xs" /></Field>}
			{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}{error.includes("Authentication") && <> <Link className="font-bold underline" href="/login">Sign in</Link></>}</p>}
			<div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button disabled={loading} className="btn-primary">{loading ? "Submitting…" : "Submit for verification"}</button></div>
		</form>
	</ModalShell>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return <label className="block text-sm font-bold text-[#405349]"><span className="mb-2 block">{label}</span>{children}</label>;
}

function localDate() {
	const today = new Date();
	return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}
