"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, Bird, CheckCircle2, Download, Droplets, Leaf, Plus, Recycle, TreePine } from "lucide-react";
import EnvironmentalSubmissionModal from "../../components/forms/EnvironmentalSubmissionModal";
import { useAuth } from "../../hooks/useAuth";
import { getApiError, getEnvironmentalSummary, getMyEnvironmentalSubmissions, getProjects } from "../../services/platform.service";
import type { EnvironmentalActivityType, EnvironmentalSubmission, EnvironmentalSummary, Project } from "../../types";

const cards: Array<{ type: EnvironmentalActivityType; title: string; description: string; unit: string; sdgs: number[]; icon: typeof TreePine; field: keyof EnvironmentalSummary["totals"] }> = [
	{ type: "TREE_PLANTATION", title: "Tree Plantation", description: "Track newly planted trees with before-and-after evidence.", unit: "trees planted", sdgs: [13, 15], icon: TreePine, field: "trees" },
	{ type: "WATER_CONSERVATION", title: "Water Conservation", description: "Report measured water savings and explain your method.", unit: "litres saved", sdgs: [6, 7], icon: Droplets, field: "litres" },
	{ type: "WASTE_REDUCTION", title: "Waste Reduction", description: "Measure waste diverted or prevented with before-and-after evidence.", unit: "kilograms reduced", sdgs: [12, 13], icon: Recycle, field: "wasteKg" },
	{ type: "BIODIVERSITY", title: "Biodiversity", description: "Log distinct species observations with supporting photos.", unit: "species observations", sdgs: [14, 15], icon: Bird, field: "speciesObservations" },
];

export default function EarthPage() {
	const { isAuthenticated } = useAuth();
	const [summary, setSummary] = useState<EnvironmentalSummary | null>(null);
	const [submissions, setSubmissions] = useState<EnvironmentalSubmission[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [activeType, setActiveType] = useState<EnvironmentalActivityType | null>(null);
	const [analyticsMetric, setAnalyticsMetric] = useState<"verifiedSubmissions" | "trees" | "litres" | "wasteKg" | "speciesObservations">("verifiedSubmissions");

	const refresh = useCallback(async () => {
		try {
			const [metrics, projectList] = await Promise.all([getEnvironmentalSummary(), getProjects()]);
			setSummary(metrics);
			setProjects(projectList);
			if (isAuthenticated) setSubmissions(await getMyEnvironmentalSubmissions());
			setError("");
		} catch (e) {
			setError(getApiError(e, "Unable to load environmental impact data."));
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => { void refresh(); }, [refresh]);

	const environmentalProjects = useMemo(() => projects.filter((project) => (project.sdgNumbers ?? [project.sdgId]).some((sdg) => [6, 7, 12, 13, 14, 15].includes(sdg))), [projects]);
	const hasMonthlyData = Boolean(summary?.monthlyAnalytics.some((month) => month[analyticsMetric] > 0));

	function exportReport() {
		if (!summary) return;
		const rows = [
			["Month", "Trees planted", "Litres saved", "Waste reduced (kg)", "Species observations", "Verified submissions"],
			...summary.monthlyAnalytics.map((month) => [month.month, month.trees, month.litres, month.wasteKg, month.speciesObservations, month.verifiedSubmissions]),
			["All-time verified total", summary.totals.trees, summary.totals.litres, summary.totals.wasteKg, summary.totals.speciesObservations, summary.totals.verifiedSubmissions],
		];
		const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "sustainx-environmental-impact.csv";
		link.click();
		URL.revokeObjectURL(url);
	}

	return <section className="section bg-[#f7faf7]"><div className="page-container">
		<div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
			<div><div className="section-label"><Leaf size={14} />ECOGUARD</div><h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">Environmental Impact</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">Track evidence-backed action for nature and climate. Environmental totals include verified submissions only.</p></div>
			{summary && <button onClick={exportReport} className="btn-secondary"><Download size={16} />Export impact report</button>}
		</div>
		{error && <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36] sm:flex-row sm:items-center sm:justify-between"><p>{error}</p><button onClick={() => void refresh()} className="font-bold underline">Try again</button></div>}
		<div className="grid gap-5 sm:grid-cols-2">
			{cards.map((card) => {
				const Icon = card.icon;
				return <div key={card.type} className="sustain-card p-6">
					<div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f4e9] text-[#0f5132]"><Icon size={23} /></div><div className="text-right"><div className="text-2xl font-black text-[#173526]">{loading ? "..." : error ? "Unavailable" : (summary?.totals[card.field] ?? 0).toLocaleString()}</div><div className="text-[11px] font-semibold text-[#89968f]">{card.unit} · verified</div></div></div>
					<h2 className="mt-6 text-xl font-black text-[#173526]">{card.title}</h2><p className="mt-2 text-sm leading-6 text-[#68776f]">{card.description}</p>
					<div className="mt-4 flex flex-wrap gap-2">{card.sdgs.map((sdg) => <Link key={sdg} href={`/sdgs/${sdg}`} className="badge badge-green">SDG {sdg}</Link>)}</div>
					{isAuthenticated ? <button onClick={() => setActiveType(card.type)} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><Plus size={16} />Submit {card.title.toLowerCase()}</button> : <Link href="/login?next=%2Fecoguard" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]">Sign in to submit an activity<ArrowRight size={15} /></Link>}
				</div>;
			})}
		</div>
		<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			<Metric value={loading ? "..." : error ? "Unavailable" : (summary?.totals.verifiedSubmissions ?? 0).toLocaleString()} title="Verified submissions" description="Only moderator-approved submissions contribute to these impact reports." />
			<Metric value={loading ? "..." : error ? "Unavailable" : environmentalProjects.length.toLocaleString()} title="Environmental projects" description="Projects mapped to SDGs 6, 7, 12, 13, 14 or 15." />
			<Metric value={loading ? "..." : error ? "Unavailable" : String(summary?.sdgNumbers.length ?? 0)} title="Mapped SDGs" description="Water, energy, consumption, climate, ocean and land goals." />
		</div>
		<div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
			<div className="sustain-card p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-extrabold text-[#173526]">Monthly environmental analytics</h2><p className="mt-1 text-xs text-[#7d8a82]">Verified quantities by approval month.</p></div><select value={analyticsMetric} onChange={(event) => setAnalyticsMetric(event.target.value as typeof analyticsMetric)} aria-label="Select environmental monthly metric" className="h-10 rounded-lg border border-[#d9e5dc] bg-white px-3 text-xs font-semibold text-[#405349]"><option value="verifiedSubmissions">Verified submissions</option><option value="trees">Trees planted</option><option value="litres">Litres saved</option><option value="wasteKg">Waste reduced (kg)</option><option value="speciesObservations">Species observations</option></select></div><div className="mt-5 h-72">{summary && hasMonthlyData ? <ResponsiveContainer width="100%" height="100%"><BarChart data={summary.monthlyAnalytics}><CartesianGrid strokeDasharray="3 3" stroke="#e4ebe6" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 12 }} /><YAxis allowDecimals={analyticsMetric === "litres" || analyticsMetric === "wasteKg"} axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 12 }} /><Tooltip /><Bar dataKey={analyticsMetric} name={{ verifiedSubmissions: "Verified submissions", trees: "Trees planted", litres: "Litres saved", wasteKg: "Waste reduced (kg)", speciesObservations: "Species observations" }[analyticsMetric]} fill="#2e7c46" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <p role={loading ? "status" : error ? "alert" : undefined} className="grid h-full place-items-center text-center text-sm text-[#68776f]">{loading ? "Loading monthly environmental data..." : error ? "Environmental analytics are unavailable." : "No verified environmental data is available yet."}</p>}</div></div>
			<div className="sustain-card p-6"><div className="flex items-center gap-2"><Activity size={19} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">My submissions</h2></div>{!isAuthenticated ? <p className="mt-4 text-sm text-[#68776f]"><Link href="/login?next=%2Fecoguard" className="font-bold text-[#0f5132]">Sign in</Link> to submit activities and track reviews.</p> : submissions.length ? <div className="mt-4 space-y-3">{submissions.slice(0, 6).map((submission) => <div key={submission.id} className="rounded-xl border border-[#e1ebe4] p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold text-[#405349]">{submission.title}</p><SubmissionStatus status={submission.status} /></div><p className="mt-1 text-xs text-[#87938d]">{submission.quantity} {submission.unit} · {new Date(submission.submittedAt).toLocaleDateString()}</p>{submission.reviewNote && <p className="mt-2 text-xs text-[#a52b36]">{submission.reviewNote}</p>}</div>)}</div> : <p className="mt-4 text-sm text-[#87938d]">No submissions yet.</p>}</div>
		</div>
		{activeType && <EnvironmentalSubmissionModal type={activeType} onClose={() => setActiveType(null)} onCreated={(submission) => { setSubmissions((current) => [submission, ...current]); }} />}
	</div></section>;
}

function Metric({ value, title, description }: { value: string; title: string; description: string }) {
	return <div className="sustain-card p-6"><div className="text-3xl font-black text-[#0f5132]">{value}</div><p className="mt-2 text-sm font-bold text-[#5e6d65]">{title}</p><p className="mt-2 text-xs leading-5 text-[#87938d]">{description}</p></div>;
}

function SubmissionStatus({ status }: { status: EnvironmentalSubmission["status"] }) {
	const color = status === "VERIFIED" ? "badge badge-green" : status === "REJECTED" ? "badge badge-red" : "badge badge-yellow";
	return <span className={color}>{status}</span>;
}
