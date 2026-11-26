"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, RefreshCw } from "lucide-react";
import { getApiError, getMyReports } from "../../../services/platform.service";
import { useAuth } from "../../../hooks/useAuth";
import type { CommunityReport, ReportStatus } from "../../../types";

const pageSize = 12;
const statuses = ["ALL", "SUBMITTED", "UNDER_REVIEW", "INVESTIGATING", "RESOLVED", "REJECTED"];

export default function MyCommunityReportsPage() {
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [reports, setReports] = useState<CommunityReport[]>([]);
	const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, totalPages: 0 });
	const [status, setStatus] = useState("ALL");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		if (authLoading || !isAuthenticated) { setLoading(false); return; }
		let active = true; setLoading(true); setError("");
		getMyReports({ status, page: pagination.page, limit: pageSize }).then((result) => { if (active) { setReports(result.items); setPagination(result.pagination); } }).catch((cause) => { if (active) setError(getApiError(cause, "Unable to load your community reports.")); }).finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [authLoading, isAuthenticated, status, pagination.page, retryKey]);

	return <section className="section bg-[#f7faf7]"><div className="page-container max-w-5xl"><Link href="/community" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Community</Link><header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="section-label"><FileText size={14} />REPORT TRACKING</p><h1 className="mt-4 text-3xl font-black text-[#153426]">My Reports</h1><p className="mt-2 text-sm text-[#68776f]">Track review updates and resolution details for issues you submitted.</p></div><Link href="/community/reports/new" className="btn-primary">Submit a report</Link></header>
		{!authLoading && !isAuthenticated ? <div className="sustain-card p-8 text-center"><p className="text-sm text-[#68776f]">Sign in to see and track your reports.</p><Link href={`/login?next=${encodeURIComponent("/community/my-reports")}`} className="btn-primary mt-4">Sign in</Link></div> : <><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#738178]">{loading ? "Loading..." : error ? "" : `${pagination.total.toLocaleString()} reports`}</p><select value={status} onChange={(event) => { setStatus(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} aria-label="Filter your reports by status" className="h-11 rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm">{statuses.map((item) => <option key={item} value={item}>{item === "ALL" ? "All statuses" : labelStatus(item)}</option>)}</select></div>
		{error && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}<button type="button" onClick={() => setRetryKey((value) => value + 1)} className="inline-flex items-center gap-2 font-bold underline"><RefreshCw size={14} />Retry</button></div>}
		{loading ? <div className="sustain-card p-6 text-sm text-[#68776f]">Loading your reports...</div> : error ? null : reports.length ? <div className="space-y-4">{reports.map((report) => <article key={report.id} className="sustain-card p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><Status status={report.status} /><span className="badge badge-blue">{report.category}</span></div><h2 className="mt-3 text-lg font-extrabold text-[#173526]">{report.title}</h2><p className="mt-1 text-sm text-[#718078]">{report.location}</p><p className="mt-3 line-clamp-2 text-sm text-[#68776f]">{report.description}</p>{report.reviewNote && <p className="mt-3 rounded-lg bg-[#f1f8f3] p-3 text-xs text-[#52655a]">Latest update: {report.reviewNote}</p>}</div><Link href={`/community/reports/${encodeURIComponent(report.id)}`} className="btn-secondary shrink-0">View timeline</Link></div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#e7eee9] pt-3 text-xs text-[#87938c]"><span>Submitted {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "date unavailable"}</span><span>{report.statusHistory?.length ?? 0} timeline updates</span></div></article>)}</div> : <div className="sustain-card p-8 text-center"><FileText size={26} className="mx-auto text-[#0f5132]" /><h2 className="mt-3 font-extrabold text-[#173526]">No reports in this view</h2><p className="mt-2 text-sm text-[#718078]">Reports you submit will appear here with their review timeline.</p><Link href="/community/reports/new" className="btn-primary mt-4">Submit your first report</Link></div>}
		{!loading && !error && pagination.totalPages > 1 && <nav aria-label="My report pages" className="mt-6 flex items-center justify-center gap-4"><button type="button" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} className="btn-secondary disabled:opacity-50">Previous</button><span className="text-sm text-[#66766d]">Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} className="btn-secondary disabled:opacity-50">Next</button></nav>}</>}
	</div></section>;
}

function labelStatus(status: string) { return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function Status({ status }: { status: ReportStatus }) { const cls = status === "RESOLVED" ? "badge badge-green" : status === "REJECTED" ? "badge badge-red" : status === "SUBMITTED" ? "badge badge-blue" : "badge badge-yellow"; return <span className={cls}>{labelStatus(status)}</span>; }
