"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileText, MapPin, MessageCircle, Plus, RefreshCw, Search, Users } from "lucide-react";
import type { CommunityReport, CommunityReportStats } from "../../types";
import { getApiError, getCommunityReportStats, getReports, toggleReportUpvote } from "../../services/platform.service";
import { useAuth } from "../../hooks/useAuth";

const CommunityReportsMap = dynamic(() => import("../../components/community/CommunityReportsMap"), { ssr: false, loading: () => <div className="grid h-[340px] place-items-center rounded-xl border border-[#dce7df] bg-[#e9f2e9] text-sm text-[#68776f] sm:h-[420px]">Loading interactive map...</div> });
const categories = ["Waste Management", "Water & Sanitation", "Roads & Infrastructure", "Public Safety", "Environment", "Pollution", "Public Facilities", "Other"];
const statuses = ["SUBMITTED", "UNDER_REVIEW", "INVESTIGATING", "RESOLVED"];
const pageSize = 9;

export default function CommunityPage() {
	return <Suspense fallback={<section className="section"><div className="page-container text-sm text-[#68776f]">Loading community reports...</div></section>}><CommunityPageContent /></Suspense>;
}

function CommunityPageContent() {
	const router = useRouter();
	const { isAuthenticated } = useAuth();
	const [reports, setReports] = useState<CommunityReport[]>([]);
	const [mapReports, setMapReports] = useState<CommunityReport[]>([]);
	const [stats, setStats] = useState<CommunityReportStats | null>(null);
	const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, totalPages: 0 });
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("ALL");
	const [status, setStatus] = useState("ALL");
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [loading, setLoading] = useState(true);
	const [mapLoading, setMapLoading] = useState(true);
	const [statsLoading, setStatsLoading] = useState(true);
	const [error, setError] = useState("");
	const [mapError, setMapError] = useState("");
	const [statsError, setStatsError] = useState("");
	const [retryKey, setRetryKey] = useState(0);
	const [mapRetryKey, setMapRetryKey] = useState(0);
	const [statsRetryKey, setStatsRetryKey] = useState(0);
	const [workingId, setWorkingId] = useState("");
	const [notice, setNotice] = useState("");

	useEffect(() => {
		let active = true; setStatsLoading(true); setStatsError("");
		getCommunityReportStats().then((value) => { if (active) setStats(value); }).catch((cause) => { if (active) { setStats(null); setStatsError(getApiError(cause, "Community statistics are unavailable.")); } }).finally(() => { if (active) setStatsLoading(false); });
		return () => { active = false; };
	}, [statsRetryKey]);

	useEffect(() => {
		let active = true; setMapLoading(true); setMapError("");
		getReports({ limit: 100 }).then((result) => { if (active) setMapReports(result.items); }).catch((cause) => { if (active) { setMapReports([]); setMapError(getApiError(cause, "Map report locations are unavailable.")); } }).finally(() => { if (active) setMapLoading(false); });
		return () => { active = false; };
	}, [mapRetryKey]);

	useEffect(() => {
		let active = true;
		const timer = window.setTimeout(() => {
			setLoading(true); setError("");
			getReports({ search: search.trim(), category, status, from: from || undefined, to: to || undefined, page: pagination.page, limit: pageSize })
				.then((result) => { if (active) { setReports(result.items); setPagination(result.pagination); } })
				.catch((cause) => { if (active) { setReports([]); setError(getApiError(cause, "Unable to load community reports.")); } })
				.finally(() => { if (active) setLoading(false); });
		}, 180);
		return () => { active = false; window.clearTimeout(timer); };
	}, [search, category, status, from, to, pagination.page, retryKey]);

	const openReport = useCallback((id: string) => router.push(`/community/reports/${encodeURIComponent(id)}`), [router]);

	async function supportReport(report: CommunityReport) {
		if (!isAuthenticated) { router.push(`/login?next=${encodeURIComponent(`/community/reports/${report.id}`)}`); return; }
		setWorkingId(report.id); setError("");
		try { const result = await toggleReportUpvote(report.id); setReports((current) => current.map((item) => item.id === report.id ? { ...item, ...result } : item)); }
		catch (cause) { setError(getApiError(cause, "Unable to support this report.")); }
		finally { setWorkingId(""); }
	}

	function clearFilters() { setSearch(""); setCategory("ALL"); setStatus("ALL"); setFrom(""); setTo(""); setPagination((current) => ({ ...current, page: 1 })); }
	const statValue = (value: number | undefined) => statsLoading ? "Loading..." : statsError || typeof value !== "number" ? "Unavailable" : value.toLocaleString();

	return <section className="section bg-[#f7faf7]"><div className="page-container">
		<header className="mb-8 flex flex-col justify-between gap-5 rounded-[2rem] bg-[#103f2b] px-6 py-8 text-white sm:px-9 sm:py-10 md:flex-row md:items-end"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#c7efce]"><Users size={14} />CivicConnect</div><h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Community Development</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[#d1e3d7] sm:text-base">Report local issues, coordinate community responses and measure real-world improvements.</p></div><div className="flex flex-wrap gap-2">{isAuthenticated && <Link href="/community/my-reports" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white"><FileText size={16} />My Reports</Link>}<Link href={isAuthenticated ? "/community/reports/new" : `/login?next=${encodeURIComponent("/community/reports/new")}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]"><Plus size={17} />{isAuthenticated ? "Report an issue" : "Sign in to report"}</Link></div></header>
		<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={MapPin} value={statValue(stats?.total)} label="Total reports" /><Stat icon={AlertTriangle} value={statValue(stats?.submitted)} label="Pending review" /><Stat icon={Clock3} value={statValue((stats?.underReview ?? 0) + (stats?.investigating ?? 0))} label="Under investigation" /><Stat icon={CheckCircle2} value={statValue(stats?.resolved)} label="Resolved issues" /></div>
		{statsError && <p role="status" className="-mt-2 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#7b8980]">Community statistics could not be loaded.<button type="button" onClick={() => setStatsRetryKey((value) => value + 1)} className="inline-flex items-center gap-1 font-bold text-[#0f5132]"><RefreshCw size={13} />Retry statistics</button></p>}
		<div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="sustain-card overflow-hidden p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-lg font-black text-[#173526]">Community report map</h2><p className="mt-1 text-xs text-[#7d8a82]">Explore report locations and open their timelines.</p></div>{mapError && <button type="button" onClick={() => setMapRetryKey((value) => value + 1)} className="text-xs font-bold text-[#0f5132] underline">Retry map</button>}</div>{mapError ? <div role="alert" className="grid h-[340px] place-items-center rounded-xl bg-[#fff0f1] p-6 text-center text-sm text-[#a52b36]">{mapError}</div> : <CommunityReportsMap reports={mapReports} onSelect={openReport} />}{!mapError && <p className="mt-2 text-[11px] text-[#87938c]">{mapLoading ? "Loading report locations..." : "Map data comes from submitted report coordinates. Map tiles © OpenStreetMap contributors."}</p>}</section>
			<section className="sustain-card p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-[#173526]">Browse reports</h2><p className="mt-1 text-xs text-[#7d8a82]">Search issues and filter by topic, status or date.</p></div><button type="button" onClick={clearFilters} className="text-xs font-bold text-[#0f5132] underline">Clear</button></div><div className="mt-4 space-y-3"><label className="relative block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#849087]" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} placeholder="Search title, description or location" aria-label="Search reports" className="h-11 w-full rounded-lg border border-[#d9e5dc] pl-9 pr-3 text-sm" /></label><label className="block text-xs font-bold text-[#68776f]">Category<select value={category} onChange={(event) => { setCategory(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="mt-1 h-10 w-full rounded-lg border border-[#d9e5dc] bg-white px-3 text-sm font-normal"><option value="ALL">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="block text-xs font-bold text-[#68776f]">Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="mt-1 h-10 w-full rounded-lg border border-[#d9e5dc] bg-white px-3 text-sm font-normal"><option value="ALL">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{labelStatus(item)}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-[#68776f]">From<input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="mt-1 h-10 w-full rounded-lg border border-[#d9e5dc] bg-white px-2 text-sm font-normal" /></label><label className="block text-xs font-bold text-[#68776f]">To<input type="date" value={to} onChange={(event) => { setTo(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="mt-1 h-10 w-full rounded-lg border border-[#d9e5dc] bg-white px-2 text-sm font-normal" /></label></div></div></section></div>
		{error && <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]"><span>{error}</span><button type="button" onClick={() => setRetryKey((value) => value + 1)} className="inline-flex items-center gap-1 font-bold underline"><RefreshCw size={14} />Retry</button></div>}
		<section className="mt-8"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#789087]">CIVIC RESPONSE</p><h2 className="mt-1 text-2xl font-black text-[#153426]">Community reports</h2><p className="mt-1 text-sm text-[#738178]">{loading ? "Loading reports..." : error ? "" : `${pagination.total.toLocaleString()} reports found`}</p></div>{isAuthenticated && <Link href="/community/my-reports" className="text-sm font-bold text-[#0f5132] hover:underline">Track my reports →</Link>}</div>
		{loading ? <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl border border-[#e1e9e3] bg-white" />)}</div> : error ? null : reports.length ? <div className="grid gap-4 md:grid-cols-2">{reports.map((report) => <article key={report.id} className="sustain-card p-5"><div className="flex flex-wrap items-center gap-2"><span className="badge badge-blue">{report.category}</span><Status status={report.status} /></div><Link href={`/community/reports/${encodeURIComponent(report.id)}`} className="mt-3 block text-lg font-extrabold text-[#173526] hover:text-[#0f5132]">{report.title}</Link><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#68776f]">{report.description}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-[#87938c]"><MapPin size={13} />{report.location}{report.createdAt ? ` · ${new Date(report.createdAt).toLocaleDateString()}` : ""}</p><div className="mt-4 flex items-center justify-between border-t border-[#e8eee9] pt-3"><span className="text-xs text-[#87938c]">{report.comments?.length ?? 0} comments</span><div className="flex items-center gap-3"><button type="button" onClick={() => void supportReport(report)} disabled={workingId === report.id} className={`inline-flex items-center gap-1.5 text-sm font-bold ${report.upvoted ? "text-[#0f5132]" : "text-[#748179]"}`}><span aria-hidden="true">↑</span>{report.upvotes ?? 0} support</button><Link href={`/community/reports/${encodeURIComponent(report.id)}`} className="inline-flex items-center gap-1 text-sm font-bold text-[#0f5132]">Details<ArrowRight size={14} /></Link></div></div></article>)}</div> : <div className="sustain-card px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf6ef] text-[#0f5132]"><FileText size={20} /></div><h3 className="mt-4 text-lg font-extrabold text-[#173526]">No reports match these filters</h3><p className="mt-2 text-sm text-[#718278]">Try another category or date range, or submit the first report for your area.</p><button type="button" onClick={clearFilters} className="btn-secondary mt-4">Clear filters</button></div>}
		{!loading && !error && pagination.totalPages > 1 && <nav aria-label="Report pages" className="mt-6 flex items-center justify-center gap-4"><button type="button" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} className="btn-secondary disabled:opacity-50"><ChevronLeft size={16} />Previous</button><span className="text-sm font-semibold text-[#66766d]">Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} className="btn-secondary disabled:opacity-50">Next<ChevronRight size={16} /></button></nav>}</section>
		<div className="mt-10 rounded-2xl bg-[#0f5132] p-7 text-white"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 className="text-2xl font-black">Your community is part of the solution.</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-[#c0d9c8]">Small reports and local actions can become measurable community impact when people collaborate.</p></div><Link href={isAuthenticated ? "/community/chat" : `/login?next=${encodeURIComponent("/community/chat")}`} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]"><MessageCircle size={16} />{isAuthenticated ? "Open Community Chat" : "Sign in to chat"}</Link></div></div>
	</div></section>;
}

function labelStatus(status: string) { return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function Stat({ icon: Icon, value, label }: { icon: typeof MapPin; value: string; label: string }) { return <article className="sustain-card p-5"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[#718278]">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf6ef] text-[#0f5132]"><Icon size={18} /></span></div><p className="mt-4 text-3xl font-black tracking-tight text-[#0f5132]" aria-live="polite">{value}</p></article>; }
function Status({ status }: { status: CommunityReport["status"] }) { const cls = status === "RESOLVED" ? "badge badge-green" : status === "SUBMITTED" ? "badge badge-blue" : "badge badge-yellow"; return <span className={cls}>{labelStatus(status)}</span>; }
