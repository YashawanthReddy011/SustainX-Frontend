"use client";

import { useEffect, useState } from "react";
import { Layers3, RefreshCw, Search, Target } from "lucide-react";
import SDGCard from "../../components/sdg-card";
import { getSDGStats, getSDGs } from "../../services/sdg.service";
import type { SDG, SDGStats } from "../../types";

const categories = ["All", "People", "Prosperity", "Planet", "Peace", "Partnership"] as const;

export default function SDGsPage() {
	const [sdgs, setSdgs] = useState<SDG[]>([]);
	const [stats, setStats] = useState<SDGStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [statsLoading, setStatsLoading] = useState(true);
	const [error, setError] = useState("");
	const [statsError, setStatsError] = useState("");
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<(typeof categories)[number]>("All");
	const [reloadKey, setReloadKey] = useState(0);
	const [statsReloadKey, setStatsReloadKey] = useState(0);

	useEffect(() => {
		let active = true;
		setStatsLoading(true);
		setStatsError("");
		getSDGStats()
			.then((result) => { if (active) setStats(result); })
			.catch(() => { if (active) { setStats(null); setStatsError("SDG statistics are unavailable."); } })
			.finally(() => { if (active) setStatsLoading(false); });
		return () => { active = false; };
	}, [statsReloadKey]);

	useEffect(() => {
		const controller = new AbortController();
		let active = true;
		const timer = window.setTimeout(() => {
			setLoading(true);
			setError("");
			getSDGs({ search: search.trim(), category, signal: controller.signal })
				.then((result) => { if (active) setSdgs(result); })
				.catch(() => {
					if (active) {
						setSdgs([]);
						setError("We couldn't load the SDGs. Check your connection and try again.");
					}
				})
				.finally(() => { if (active) setLoading(false); });
		}, 220);
		return () => {
			active = false;
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [search, category, reloadKey]);

	const statValue = (value: number | undefined) => statsLoading ? "…" : statsError || typeof value !== "number" ? "Unavailable" : value.toLocaleString();

	return (
		<section className="section overflow-hidden bg-[#f7faf7]">
			<div className="page-container">
				<header className="relative mb-9 overflow-hidden rounded-[2rem] bg-[#103f2b] px-6 py-10 text-white sm:px-10 sm:py-14">
					<div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border-[36px] border-white/5" />
					<div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-44 h-52 w-52 rounded-full border-[26px] border-white/5" />
					<div className="relative max-w-3xl">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#c7efce]"><Target size={14} />Global goals</div>
						<h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">A shared roadmap for a more sustainable future</h1>
						<p className="mt-4 max-w-2xl text-sm leading-7 text-[#d1e3d7] sm:text-base">Explore the United Nations Sustainable Development Goals and find ways to turn global priorities into local action.</p>
					</div>
				</header>

				<div className="mb-8 grid gap-4 sm:grid-cols-3">
					<StatCard icon={Target} label="Global goals" value={statValue(stats?.totalGoals)} />
					<StatCard icon={Layers3} label="Development pillars" value={statValue(stats?.totalPillars)} />
					<StatCard icon={Target} label="Official UN targets" value={statValue(stats?.totalTargets)} />
				</div>
				{statsError && <div role="status" className="-mt-4 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#7b8980]">Statistics could not be loaded from the API.<button type="button" onClick={() => setStatsReloadKey((value) => value + 1)} className="inline-flex items-center gap-1.5 font-bold text-[#0f5132]"><RefreshCw size={13} />Retry stats</button></div>}

				<div className="mb-7 rounded-2xl border border-[#dce7df] bg-white p-4 shadow-sm sm:p-5">
					<div className="flex flex-col gap-3 md:flex-row">
						<label className="relative flex-1">
							<Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#849087]" />
							<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by goal number or name" aria-label="Search by SDG number or name" className="h-12 w-full rounded-xl border border-[#d8e4dc] bg-[#fbfdfb] pl-11 pr-4 text-sm outline-none transition focus:border-[#74a980] focus:ring-4 focus:ring-[#74a980]/10" />
						</label>
						<label className="flex items-center gap-3 rounded-xl border border-[#d8e4dc] bg-[#fbfdfb] px-4 focus-within:border-[#74a980]">
							<span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#718278]">Pillar</span>
							<select value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number])} aria-label="Filter SDGs by pillar" className="h-12 min-w-32 flex-1 bg-transparent text-sm font-semibold text-[#405349] outline-none">
								{categories.map((item) => <option key={item} value={item}>{item === "All" ? "All pillars" : item}</option>)}
							</select>
						</label>
					</div>
				</div>

				<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
					<div><h2 className="text-2xl font-black text-[#153426]">Explore the goals</h2><p className="mt-1 text-sm text-[#738178]">{loading ? "Loading goals…" : error ? "" : `${sdgs.length} ${sdgs.length === 1 ? "goal" : "goals"} shown`}</p></div>
					<p className="text-xs text-[#849087]">Target counts are official UN targets, separate from SustainX actions.</p>
				</div>

				{error ? (
					<div role="alert" className="rounded-2xl border border-[#f3cfd2] bg-white p-8 text-center">
						<p className="font-bold text-[#8e2c35]">{error}</p>
						<button type="button" onClick={() => setReloadKey((value) => value + 1)} className="btn-secondary mt-4 inline-flex items-center gap-2"><RefreshCw size={15} />Retry</button>
					</div>
				) : loading ? (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading SDGs">
						{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-[#e1e9e3] bg-white" />)}
					</div>
				) : sdgs.length ? (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{sdgs.map((sdg) => <SDGCard key={sdg.id} sdg={sdg} />)}</div>
				) : (
					<div className="rounded-2xl border border-dashed border-[#cbd9ce] bg-white px-6 py-12 text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf6ef] text-[#0f5132]"><Search size={20} /></div>
						<h3 className="mt-4 text-lg font-extrabold text-[#173526]">No matching goals</h3>
						<p className="mt-2 text-sm text-[#718278]">Try another search or choose a different pillar.</p>
						<button type="button" onClick={() => { setSearch(""); setCategory("All"); }} className="btn-secondary mt-5">Clear search and filters</button>
					</div>
				)}
			</div>
		</section>
	);
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
	return <article className="rounded-2xl border border-[#dce7df] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[#718278]">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf6ef] text-[#0f5132]"><Icon size={18} /></span></div><p className="mt-4 text-3xl font-black tracking-tight text-[#0f5132]" aria-live="polite">{value}</p></article>;
}
