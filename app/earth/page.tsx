"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, Bird, CheckCircle2, CloudSun, Download, Droplets, Leaf, Plus, Recycle, RefreshCw, TreePine, Waves, Zap } from "lucide-react";
import EnvironmentalSubmissionModal from "../../components/forms/EnvironmentalSubmissionModal";
import { useAuth } from "../../hooks/useAuth";
import { getApiError, getEnvironmentalSummary, getMyEnvironmentalSubmissions, getProjects } from "../../services/platform.service";
import type { EnvironmentalActivityType, EnvironmentalSubmission, EnvironmentalSummary, Project } from "../../types";

const environmentalSdgs = [6, 7, 12, 13, 14, 15];
const cards: Array<{ type: EnvironmentalActivityType; title: string; description: string; unit: string; sdg: number; icon: typeof TreePine; field: keyof EnvironmentalSummary["totals"] }> = [
	{ type: "TREE_PLANTATION", title: "Tree Plantation", description: "Record new native trees with before-and-after evidence.", unit: "trees planted", sdg: 15, icon: TreePine, field: "trees" },
	{ type: "TREE_SURVIVAL", title: "Tree Survival", description: "Follow up on planted trees and record verified survival.", unit: "trees surviving", sdg: 15, icon: TreePine, field: "treeSurvival" },
	{ type: "WATER_CONSERVATION", title: "Water Conservation", description: "Report measured water savings with a clear method.", unit: "litres saved", sdg: 6, icon: Droplets, field: "litres" },
	{ type: "RENEWABLE_ENERGY", title: "Renewable Energy", description: "Track measured renewable energy generated or saved.", unit: "kWh generated or saved", sdg: 7, icon: Zap, field: "kwh" },
	{ type: "WASTE_REDUCTION", title: "Waste Reduction", description: "Measure waste diverted or prevented for one activity.", unit: "kg diverted", sdg: 12, icon: Recycle, field: "wasteKg" },
	{ type: "CLIMATE_ACTION", title: "Climate Action", description: "Submit evidence for a specific climate action.", unit: "verified actions", sdg: 13, icon: CloudSun, field: "climateActions" },
	{ type: "MARINE_PROTECTION", title: "Marine Protection", description: "Record coastal or marine protection actions.", unit: "verified actions", sdg: 14, icon: Waves, field: "marineActions" },
	{ type: "BIODIVERSITY", title: "Biodiversity", description: "Document distinct local species observations.", unit: "species observations", sdg: 15, icon: Bird, field: "speciesObservations" },
];

const analyticsLabels: Record<keyof EnvironmentalSummary["totals"], string> = {
	trees: "Trees planted", treeSurvival: "Trees surviving", litres: "Litres saved", kwh: "Renewable energy (kWh)",
	wasteKg: "Waste diverted (kg)", climateActions: "Climate actions", marineActions: "Marine protection actions",
	speciesObservations: "Species observations", verifiedSubmissions: "Verified submissions",
};

export default function EarthPage() {
	const { isAuthenticated } = useAuth();
	const [summary, setSummary] = useState<EnvironmentalSummary | null>(null);
	const [submissions, setSubmissions] = useState<EnvironmentalSubmission[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [projectsLoading, setProjectsLoading] = useState(true);
	const [submissionsLoading, setSubmissionsLoading] = useState(false);
	const [error, setError] = useState("");
	const [projectsError, setProjectsError] = useState("");
	const [submissionsError, setSubmissionsError] = useState("");
	const [activeType, setActiveType] = useState<EnvironmentalActivityType | null>(null);
	const [analyticsMetric, setAnalyticsMetric] = useState<keyof EnvironmentalSummary["totals"]>("verifiedSubmissions");

	const refresh = useCallback(async () => {
		setLoading(true); setProjectsLoading(true); setProjectsError(""); setError("");
		setSubmissionsLoading(isAuthenticated); setSubmissionsError("");
		const results = await Promise.allSettled([
			getEnvironmentalSummary(),
			getProjects({ limit: 100 }),
			isAuthenticated ? getMyEnvironmentalSubmissions() : Promise.resolve([] as EnvironmentalSubmission[]),
		]);
		const [summaryResult, projectResult, submissionResult] = results;
		if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);
		else { setSummary(null); setError(getApiError(summaryResult.reason, "Environmental statistics are unavailable.")); }
		if (projectResult.status === "fulfilled") setProjects(projectResult.value.items);
		else { setProjects([]); setProjectsError(getApiError(projectResult.reason, "Environmental projects are unavailable.")); }
		if (submissionResult.status === "fulfilled") setSubmissions(submissionResult.value);
		else { setSubmissions([]); setSubmissionsError(getApiError(submissionResult.reason, "Your activity submissions are unavailable.")); }
		setLoading(false); setProjectsLoading(false); setSubmissionsLoading(false);
	}, [isAuthenticated]);

	useEffect(() => { void refresh(); }, [refresh]);

	const environmentalProjects = useMemo(() => projects.filter((project) => (project.sdgNumbers ?? [project.sdgId]).some((sdg) => environmentalSdgs.includes(sdg))), [projects]);
	const hasMonthlyData = Boolean(summary?.monthlyAnalytics.some((month) => month[analyticsMetric] > 0));
	const sdgCount = summary?.sdgNumbers.length ?? environmentalSdgs.length;

	function exportReport() {
		if (!summary) return;
		const columns: Array<keyof EnvironmentalSummary["totals"]> = ["trees", "treeSurvival", "litres", "kwh", "wasteKg", "climateActions", "marineActions", "speciesObservations", "verifiedSubmissions"];
		const rows = [
			["Month", ...columns.map((column) => analyticsLabels[column])],
			...summary.monthlyAnalytics.map((month) => [month.month, ...columns.map((column) => month[column])]),
			["All-time verified total", ...columns.map((column) => summary.totals[column])],
		];
		const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a"); link.href = url; link.download = "sustainx-ecoguard-impact.csv"; link.click(); URL.revokeObjectURL(url);
	}

	const statValue = (value: number | undefined, failed = false) => loading ? "Loading..." : failed || typeof value !== "number" ? "Unavailable" : value.toLocaleString();

	return <section className="section bg-[#f7faf7]"><div className="page-container">
		<header className="mb-6 overflow-hidden rounded-[2rem] bg-[#103f2b] px-6 py-8 text-white sm:px-9 sm:py-10">
			<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#c7efce]"><Leaf size={14} />EcoGuard | Environmental Impact</p><h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">Protect the systems that protect us.</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[#d1e3d7] sm:text-base">Build environmental awareness through tree plantation, biodiversity records, water conservation and responsible consumption.</p><div className="mt-4 flex flex-wrap gap-2">{environmentalSdgs.map((sdg) => <Link key={sdg} href={`/sdgs/${sdg}`} className="rounded-full bg-[#0c663d] px-3 py-1 text-xs font-bold text-[#d5f2dc]">SDG {sdg}</Link>)}</div></div><div className="flex shrink-0 flex-col gap-2">{summary && <button type="button" onClick={exportReport} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white"><Download size={16} />Export verified impact</button>}{isAuthenticated ? <button type="button" onClick={() => setActiveType("TREE_PLANTATION")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]"><Plus size={16} />Add an environmental activity</button> : <Link href={`/login?next=${encodeURIComponent("/ecoguard")}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">Sign in to add an activity<ArrowRight size={16} /></Link>}</div></div>
		</header>
		<div className="mb-7 grid gap-4 sm:grid-cols-3"><Metric value={String(sdgCount)} title="Environmental SDGs" description="Supported goals: 6, 7, 12, 13, 14 and 15." /><Metric value={statValue(summary?.totals.verifiedSubmissions, Boolean(error))} title="Verified activities" description="Only approved evidence contributes to these counts." /><Metric value={statValue(environmentalProjects.length, Boolean(projectsError) || projectsLoading)} title="Environmental projects" description="Published projects connected to an environmental SDG." /></div>
		{(error || projectsError) && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]"><span>{error || projectsError}</span><button type="button" onClick={() => void refresh()} className="inline-flex items-center gap-2 font-bold underline"><RefreshCw size={14} />Retry EcoGuard data</button></div>}
		<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map((card) => { const Icon = card.icon; const quantity = summary?.totals[card.field]; return <article key={card.type} className="sustain-card flex flex-col p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f4e9] text-[#0f5132]"><Icon size={23} /></span><span className="text-right"><strong className="block text-2xl font-black text-[#173526]">{loading ? "..." : error || typeof quantity !== "number" ? "Unavailable" : quantity.toLocaleString()}</strong><span className="text-[11px] font-semibold text-[#89968f]">{card.unit} verified</span></span></div><h2 className="mt-5 text-lg font-black text-[#173526]">{card.title}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-[#68776f]">{card.description}</p><div className="mt-4 flex items-center justify-between gap-3"><Link href={`/sdgs/${card.sdg}`} className="badge badge-green">Explore SDG {card.sdg}</Link>{isAuthenticated ? <button type="button" onClick={() => setActiveType(card.type)} className="inline-flex items-center gap-1 text-sm font-bold text-[#0f5132]"><Plus size={15} />Submit</button> : <Link href={`/login?next=${encodeURIComponent("/ecoguard")}`} className="text-xs font-bold text-[#0f5132]">Sign in to submit</Link>}</div></article>; })}</section>
		<div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
			<section className="sustain-card p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><Activity size={19} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Verified environmental analytics</h2></div><p className="mt-1 text-xs text-[#7d8a82]">Each quantity stays in its own unit and is counted after review.</p></div><select value={analyticsMetric} onChange={(event) => setAnalyticsMetric(event.target.value as keyof EnvironmentalSummary["totals"])} aria-label="Select environmental metric" className="h-10 rounded-lg border border-[#d9e5dc] bg-white px-3 text-xs font-semibold text-[#405349]">{Object.entries(analyticsLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="mt-5 h-72">{summary && hasMonthlyData ? <ResponsiveContainer width="100%" height="100%"><BarChart data={summary.monthlyAnalytics}><CartesianGrid strokeDasharray="3 3" stroke="#e4ebe6" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 12 }} /><YAxis allowDecimals={["litres", "kwh", "wasteKg"].includes(analyticsMetric)} axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 12 }} /><Tooltip /><Bar dataKey={analyticsMetric} name={analyticsLabels[analyticsMetric]} fill="#2e7c46" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <p role={loading ? "status" : error ? "alert" : undefined} className="grid h-full place-items-center text-center text-sm text-[#68776f]">{loading ? "Loading verified environmental data..." : error ? "Environmental analytics are unavailable." : "No verified environmental data is available yet."}</p>}</div></section>
			<section className="sustain-card p-6"><div className="flex items-center gap-2"><CheckCircle2 size={19} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">My submissions</h2></div>{!isAuthenticated ? <p className="mt-4 text-sm text-[#68776f]"><Link href={`/login?next=${encodeURIComponent("/ecoguard")}`} className="font-bold text-[#0f5132]">Sign in</Link> to submit activities and track reviews.</p> : submissionsLoading ? <p className="mt-4 text-sm text-[#68776f]">Loading your submissions...</p> : submissionsError ? <div className="mt-4 text-sm text-[#a52b36]" role="alert">{submissionsError}<button type="button" onClick={() => void refresh()} className="ml-2 font-bold underline">Retry</button></div> : submissions.length ? <div className="mt-4 space-y-3">{submissions.slice(0, 6).map((submission) => <div key={submission.id} className="rounded-xl border border-[#e1ebe4] p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold text-[#405349]">{submission.title}</p><SubmissionStatus status={submission.status} /></div><p className="mt-1 text-xs text-[#87938d]">{submission.quantity} {submission.unit} | {submission.activityDate ? new Date(`${submission.activityDate.slice(0, 10)}T00:00:00`).toLocaleDateString() : "Date unavailable"}</p>{submission.reviewNote && <p className="mt-2 text-xs text-[#a52b36]">{submission.reviewNote}</p>}</div>)}</div> : <p className="mt-4 text-sm text-[#87938d]">No submissions yet.</p>}</section>
		</div>
		<section className="mt-8 rounded-2xl border border-[#dce7df] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="section-label">CONNECTED IMPACT</p><h2 className="mt-2 text-xl font-black text-[#173526]">Carry environmental work into the community</h2><p className="mt-2 text-sm text-[#68776f]">Explore campaigns and projects connected to the same SDGs.</p></div><div className="flex flex-wrap gap-3"><Link href="/challenges?sdg=15" className="btn-secondary">Environmental challenges<ArrowRight size={15} /></Link><Link href="/projects?sdg=15" className="btn-primary">Impact projects<ArrowRight size={15} /></Link></div></div>{projectsLoading && <p className="mt-3 text-xs text-[#87938d]">Loading related project counts...</p>}</section>
		{activeType && <EnvironmentalSubmissionModal type={activeType} onClose={() => setActiveType(null)} onCreated={(submission) => setSubmissions((current) => [submission, ...current])} />}
	</div></section>;
}

function Metric({ value, title, description }: { value: string; title: string; description: string }) {
	return <div className="sustain-card p-5"><div className="text-3xl font-black text-[#0f5132]">{value}</div><p className="mt-2 text-sm font-bold text-[#5e6d65]">{title}</p><p className="mt-2 text-xs leading-5 text-[#87938d]">{description}</p></div>;
}

function SubmissionStatus({ status }: { status: EnvironmentalSubmission["status"] }) {
	const color = status === "VERIFIED" ? "badge badge-green" : status === "REJECTED" ? "badge badge-red" : "badge badge-yellow";
	return <span className={color}>{status}</span>;
}
