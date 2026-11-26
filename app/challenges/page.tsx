"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, Search, Target, Trophy, Users } from "lucide-react";
import type { Challenge, ChallengeStats } from "../../types";
import { getApiError, getChallengeStats, getChallenges } from "../../services/platform.service";
import { useAuth } from "../../hooks/useAuth";

const PAGE_SIZE = 9;

export default function ChallengesPage() {
	return <Suspense fallback={<section className="section bg-[#f7faf7]"><div className="page-container text-sm text-[#68776f]">Loading challenges…</div></section>}><ChallengesPageContent /></Suspense>;
}

function ChallengesPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const { isAuthenticated } = useAuth();
	const rawSdg = searchParams.get("sdg") ?? searchParams.get("sdgId") ?? "";
	const parsedSdg = rawSdg ? Number(rawSdg) : null;
	const selectedSdg = Number.isInteger(parsedSdg) && parsedSdg !== null && parsedSdg >= 1 && parsedSdg <= 17 ? String(parsedSdg) : "";
	const [items, setItems] = useState<Challenge[]>([]);
	const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
	const [stats, setStats] = useState<ChallengeStats | null>(null);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [difficulty, setDifficulty] = useState("");
	const [sort, setSort] = useState("newest");
	const [page, setPage] = useState(1);
	const [mine, setMine] = useState(false);
	const [loading, setLoading] = useState(true);
	const [statsLoading, setStatsLoading] = useState(true);
	const [error, setError] = useState("");
	const [statsError, setStatsError] = useState("");
	const [retryKey, setRetryKey] = useState(0);
	const [statsRetryKey, setStatsRetryKey] = useState(0);

	useEffect(() => {
		let active = true;
		setStatsLoading(true);
		setStatsError("");
		getChallengeStats()
			.then((result) => { if (active) setStats(result); })
			.catch((cause) => { if (active) { setStats(null); setStatsError(getApiError(cause, "Statistics are unavailable.")); } })
			.finally(() => { if (active) setStatsLoading(false); });
		return () => { active = false; };
	}, [statsRetryKey]);

	useEffect(() => {
		const controller = new AbortController();
		let active = true;
		const timer = window.setTimeout(() => {
			setLoading(true);
			setError("");
			getChallenges({ search: search.trim(), status, difficulty, sort, page, limit: PAGE_SIZE, ...(selectedSdg ? { sdg: Number(selectedSdg) } : {}), ...(mine ? { mine: true } : {}), signal: controller.signal })
				.then((result) => {
					if (!active) return;
					setItems(result.items);
					setPagination(result.pagination);
				})
				.catch((cause) => {
					if (!active || controller.signal.aborted) return;
					setItems([]);
					setPagination({ page, limit: PAGE_SIZE, total: 0, totalPages: 0 });
					setError(getApiError(cause, "Unable to load challenges. Check that the API and database are running."));
				})
				.finally(() => { if (active) setLoading(false); });
		}, 240);
		return () => { active = false; window.clearTimeout(timer); controller.abort(); };
	}, [search, selectedSdg, status, difficulty, sort, page, mine, retryKey]);

	function changeSdg(value: string) {
		const next = new URLSearchParams(searchParams.toString());
		next.delete("sdgId");
		if (value) next.set("sdg", value); else next.delete("sdg");
		router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
		setPage(1);
	}

	function clearFilters() {
		setSearch(""); setStatus("all"); setDifficulty(""); setSort("newest"); setMine(false); setPage(1);
		if (selectedSdg) router.replace(pathname, { scroll: false });
	}

	const statValue = (value: number | undefined) => statsLoading ? "…" : statsError || typeof value !== "number" ? "Unavailable" : value.toLocaleString();

	return <section className="section bg-[#f7faf7]"><div className="page-container">
		<header className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#103f2b] px-6 py-9 text-white sm:px-10 sm:py-12"><div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full border-[32px] border-white/5" /><div className="relative"><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#c7efce]"><Trophy size={14} />Take action</div><div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><h1 className="text-3xl font-black leading-tight sm:text-5xl">Discover challenges. Create impact.</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[#d1e3d7] sm:text-base">Take part in meaningful sustainability challenges, track your verified progress and turn local action into measurable impact.</p></div><label className="relative block w-full lg:w-[340px]"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#809187]" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search title or description" aria-label="Search challenges by title or description" className="h-12 w-full rounded-xl border border-white/20 bg-white pl-11 pr-4 text-sm text-[#173526] outline-none placeholder:text-[#89958e] focus:ring-4 focus:ring-white/20" /></label></div></div></header>

		<div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<StatCard icon={Trophy} label="Active challenges" value={statValue(stats?.activeChallenges)} />
			<StatCard icon={Users} label="Participants" value={statValue(stats?.participants)} />
			<StatCard icon={CheckCircle2} label="Verified challenge actions" value={statValue(stats?.verifiedActions)} />
			<StatCard icon={CalendarDays} label="Upcoming challenges" value={statValue(stats?.upcomingChallenges)} />
		</div>
		{statsError && <div role="status" className="-mt-4 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#7b8980]">Challenge statistics could not be loaded.<button type="button" onClick={() => setStatsRetryKey((value) => value + 1)} className="inline-flex items-center gap-1.5 font-bold text-[#0f5132]"><RefreshCw size={13} />Retry statistics</button></div>}

		<div className="mb-5 rounded-2xl border border-[#dce7df] bg-white p-4 shadow-sm sm:p-5"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			<label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#819087]">Challenge status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter by challenge status" className={selectClass}><option value="all">All statuses</option><option value="active">Active</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option></select></label>
			<label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#819087]">SDG goal</span><select value={selectedSdg} onChange={(event) => changeSdg(event.target.value)} aria-label="Filter by SDG" className={selectClass}><option value="">All SDGs</option>{Array.from({ length: 17 }, (_, index) => <option key={index + 1} value={index + 1}>SDG {index + 1}</option>)}</select></label>
			<label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#819087]">Difficulty</span><select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setPage(1); }} aria-label="Filter by difficulty" className={selectClass}><option value="">All difficulties</option><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></label>
			<label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#819087]">Sort by</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort challenges" className={selectClass}><option value="newest">Newest</option><option value="popular">Most popular</option><option value="deadline">Ending soon</option></select></label>
		</div></div>

		{selectedSdg && <div className="sustain-card mb-5 flex flex-wrap items-center justify-between gap-3 px-5 py-4"><p className="text-sm text-[#52645a]">Showing challenges connected to <Link href={`/sdgs/${selectedSdg}`} className="font-extrabold text-[#0f5132] hover:underline">SDG {selectedSdg}</Link></p><button onClick={() => changeSdg("")} className="text-sm font-bold text-[#0f5132] hover:underline">Clear SDG filter</button></div>}

		<div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#789087]">TAKE PART</p><h2 className="mt-1 text-2xl font-black text-[#153426]">{mine ? "My challenges" : "Explore challenges"}</h2><p className="mt-1 text-sm text-[#738178]">{loading ? "Loading challenges…" : error ? "" : `${pagination.total.toLocaleString()} ${pagination.total === 1 ? "challenge" : "challenges"} found`}</p></div><div className="flex items-center gap-2">{isAuthenticated ? <button type="button" onClick={() => { setMine((value) => !value); setPage(1); }} className={`rounded-full px-4 py-2 text-xs font-bold ${mine ? "bg-[#0f5132] text-white" : "border border-[#d9e5dc] bg-white text-[#587064]"}`}>{mine ? "Viewing my challenges" : "My challenges"}</button> : <Link href="/login?next=%2Fchallenges" className="text-xs font-bold text-[#0f5132] hover:underline">Sign in to track your challenges</Link>}</div></div>

		{error ? <div role="alert" className="rounded-2xl border border-[#f3cfd2] bg-white p-8 text-center"><h3 className="font-black text-[#8e2c35]">Unable to load challenges</h3><p className="mt-2 text-sm text-[#8e2c35]">{error}</p><button type="button" onClick={() => setRetryKey((value) => value + 1)} className="btn-secondary mt-4 inline-flex items-center gap-2"><RefreshCw size={15} />Retry</button></div> : loading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading challenges">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl border border-[#e1e9e3] bg-white" />)}</div> : !items.length ? <div className="rounded-2xl border border-dashed border-[#cbd9ce] bg-white px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf6ef] text-[#0f5132]"><Trophy size={20} /></div><h3 className="mt-4 text-lg font-extrabold text-[#173526]">{mine ? "You haven’t joined any challenges yet" : "No challenges found"}</h3><p className="mt-2 text-sm text-[#718278]">{mine ? "Explore active challenges and join one to start tracking your progress." : selectedSdg ? `No challenges are connected to SDG ${selectedSdg} with these filters.` : "There are no challenges matching these filters right now."}</p><button type="button" onClick={clearFilters} className="btn-secondary mt-5">Clear filters</button></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div>}

		{!loading && !error && pagination.totalPages > 1 && <nav aria-label="Challenge pages" className="mt-8 flex items-center justify-center gap-4"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="btn-secondary disabled:opacity-50"><ChevronLeft size={16} />Previous</button><span className="text-sm font-semibold text-[#66766d]">Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="btn-secondary disabled:opacity-50">Next<ChevronRight size={16} /></button></nav>}
	</div></section>;
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
	const sdgs = challenge.sdgNumbers?.length ? challenge.sdgNumbers : [challenge.sdgId];
	const status = challenge.computedStatus ?? challenge.status ?? "ACTIVE";
	return <article className="sustain-card sustain-card-hover flex min-w-0 flex-col overflow-hidden"><div className="h-1.5 bg-[#2e7d46]" /><div className="flex flex-1 flex-col p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${status === "ACTIVE" ? "bg-[#e8f5eb] text-[#28643a]" : status === "UPCOMING" ? "bg-[#eef5ff] text-[#305f9b]" : "bg-[#f1f3f2] text-[#647169]"}`}>{status.toLowerCase()}</span><span className="rounded-full bg-[#fff5df] px-3 py-1 text-xs font-black text-[#8b641d]">{challenge.points} pts</span></div><h3 className="mt-4 text-xl font-black leading-snug text-[#173526]">{challenge.title}</h3><p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-[#68776f]">{challenge.description}</p><div className="mt-4 flex flex-wrap gap-2">{sdgs.map((number) => <Link key={number} href={`/sdgs/${number}`} className="rounded-full bg-[#edf6ef] px-2.5 py-1 text-[11px] font-bold text-[#316143] hover:bg-[#dcefe0]">SDG {number}</Link>)}</div><div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#f5f8f5] p-3"><SmallMetric icon={Target} label="Difficulty" value={challenge.difficulty ?? "Not set"} /><SmallMetric icon={Users} label="Participants" value={String(challenge.participants ?? 0)} /><SmallMetric icon={CalendarDays} label="Deadline" value={formatDate(challenge.endDate ?? challenge.deadline)} /><SmallMetric icon={CheckCircle2} label="My progress" value={challenge.joined ? `${challenge.myProgress?.completionPercent ?? 0}%` : "Not joined"} /></div><Link href={`/challenges/${encodeURIComponent(challenge.id)}`} className="btn-secondary mt-5 w-full justify-center">View challenge<ArrowRight size={16} /></Link></div></article>;
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
	return <article className="rounded-2xl border border-[#dce7df] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[#718278]">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf6ef] text-[#0f5132]"><Icon size={18} /></span></div><p className="mt-4 text-3xl font-black tracking-tight text-[#0f5132]" aria-live="polite">{value}</p></article>;
}

function SmallMetric({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
	return <div className="min-w-0"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#839087]"><Icon size={12} />{label}</p><p className="mt-1 truncate text-xs font-extrabold text-[#405349]">{value}</p></div>;
}

function formatDate(value?: string) {
	if (!value) return "Open";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "Open" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const selectClass = "h-11 w-full rounded-xl border border-[#d8e4dc] bg-[#fbfdfb] px-3 text-sm font-semibold text-[#405349] outline-none focus:border-[#74a980] focus:ring-4 focus:ring-[#74a980]/10";
