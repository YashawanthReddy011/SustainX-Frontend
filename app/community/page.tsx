"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MapPin, AlertTriangle, Plus, ArrowRight, CheckCircle2, X, MessageCircle, ThumbsUp, Clock3, Image as ImageIcon, Search } from "lucide-react";
import type { CommunityReport } from "../../types";
import { addReportComment, getApiError, getReports, toggleReportUpvote } from "../../services/platform.service";
import { useAuth } from "../../hooks/useAuth";
import ReportCreateModal from "../../components/forms/ReportCreateModal";
import ModalShell from "../../components/forms/ModalShell";

export default function CommunityPage() {
	const [reports, setReports] = useState<CommunityReport[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showCreate, setShowCreate] = useState(false); const [selected, setSelected] = useState<CommunityReport | null>(null);
	const [reportComment, setReportComment] = useState("");
	const [reportActionError, setReportActionError] = useState("");
	const [reportStatusFilter, setReportStatusFilter] = useState("ALL");
	const [reportCategoryFilter, setReportCategoryFilter] = useState("ALL");
	const [locationFilter, setLocationFilter] = useState("");
	const { isAuthenticated } = useAuth();
	useEffect(() => {
		let active = true;
		const load = async (initial: boolean) => {
			try {
				const items = await getReports();
				if (active) { setReports(items); setError(""); }
			} catch (e) {
				if (active) setError(getApiError(e, "Unable to load community reports. Check that the API is running."));
			} finally {
				if (active && initial) setLoading(false);
			}
		};
		void load(true);
		const interval = window.setInterval(() => { void load(false); }, 30000);
		return () => { active = false; window.clearInterval(interval); };
	}, []);
	const underReview = reports.filter((report) => ["UNDER_REVIEW", "IN_PROGRESS"].includes(report.status)).length;
	const pending = reports.filter((report) => report.status === "REPORTED").length;
	const resolved = reports.filter((report) => report.status === "RESOLVED").length;
	const categories = Array.from(new Set(reports.map((report) => report.category))).sort();
	const visibleReports = reports.filter((report) =>
		(reportStatusFilter === "ALL" || report.status === reportStatusFilter) &&
		(reportCategoryFilter === "ALL" || report.category === reportCategoryFilter) &&
		(!locationFilter.trim() || `${report.location} ${report.title}`.toLowerCase().includes(locationFilter.trim().toLowerCase()))
	);
	async function upvoteReport(report: CommunityReport) {
		if (!isAuthenticated) return;
		try {
			const result = await toggleReportUpvote(report.id);
			setReports((items) => items.map((item) => item.id === report.id ? { ...item, ...result } : item));
			if (selected?.id === report.id) setSelected({ ...selected, ...result });
		} catch (e) { setReportActionError(getApiError(e, "Unable to support this report.")); }
	}
	async function postReportComment(event: React.FormEvent) {
		event.preventDefault();
		if (!selected || !reportComment.trim()) return;
		try {
			const comment = await addReportComment(selected.id, reportComment.trim());
			const updated = { ...selected, comments: [...(selected.comments ?? []), comment] };
			setSelected(updated);
			setReports((items) => items.map((item) => item.id === selected.id ? updated : item));
			setReportComment("");
			setReportActionError("");
		} catch (e) { setReportActionError(getApiError(e, "Unable to add your comment.")); }
	}
	const mappedReports = reports.filter((report) => typeof report.latitude === "number" && typeof report.longitude === "number");
	const mapBounds = mappedReports.reduce((bounds, report) => ({
		minLatitude: Math.min(bounds.minLatitude, report.latitude!),
		maxLatitude: Math.max(bounds.maxLatitude, report.latitude!),
		minLongitude: Math.min(bounds.minLongitude, report.longitude!),
		maxLongitude: Math.max(bounds.maxLongitude, report.longitude!),
	}), { minLatitude: 90, maxLatitude: -90, minLongitude: 180, maxLongitude: -180 });
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="section-label"><Users size={14} />CIVICCONNECT</div><h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">Community Development</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">Connect communities with action. Report issues, support local initiatives and collaborate on solutions.</p></div>{isAuthenticated ? <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={17} />Report an Issue</button> : <Link href="/login?next=%2Fcommunity" className="btn-primary"><Plus size={17} />Sign in to report</Link>}</div>
		{error && <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36] sm:flex-row sm:items-center sm:justify-between"><p>{error}</p><button onClick={() => window.location.reload()} className="font-bold underline">Try again</button></div>}
		<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={MapPin} value={reports.length} label="Total Reports" /><Stat icon={AlertTriangle} value={pending} label="Pending Review" /><Stat icon={Clock3} value={underReview} label="Under Investigation" /><Stat icon={CheckCircle2} value={resolved} label="Resolved Issues" /></div>
		<div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
			<div className="sustain-card overflow-hidden p-5">
				<div className="mb-4"><h2 className="text-lg font-black text-[#173526]">Community report map</h2><p className="mt-1 text-xs text-[#7d8a82]">Reports with submitted coordinates are shown below.</p></div>
				<div className="relative h-64 overflow-hidden rounded-xl border border-[#dce7df] bg-[#e9f2e9]">
					<div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(#bfd4c4 1px, transparent 1px), linear-gradient(90deg, #bfd4c4 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
					{mappedReports.map((report) => <button key={report.id} title={`${report.title} — ${report.location}`} onClick={() => setSelected(report)} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${12 + ((report.longitude! - mapBounds.minLongitude) / (mapBounds.maxLongitude - mapBounds.minLongitude || 1)) * 76}%`, top: `${12 + ((mapBounds.maxLatitude - report.latitude!) / (mapBounds.maxLatitude - mapBounds.minLatitude || 1)) * 76}%` }}><MapPin size={26} fill="#0f5132" className="text-white drop-shadow" /></button>)}
					{mappedReports.length === 0 && <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-[#68776f]">Add latitude and longitude when submitting a report to place it on the map.</p>}
					<span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-xs font-bold text-[#53635a]">{mappedReports.length} mapped reports</span>
				</div>
			</div>
			<div className="sustain-card p-5"><h2 className="text-lg font-black text-[#173526]">Browse reports</h2><div className="mt-4 space-y-3"><label className="relative block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#849087]" /><input value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Filter by location or title" className="h-10 w-full rounded-lg border border-[#d9e5dc] pl-9 pr-3 text-sm" /></label><select value={reportCategoryFilter} onChange={(event) => setReportCategoryFilter(event.target.value)} aria-label="Filter reports by category" className="h-10 w-full rounded-lg border border-[#d9e5dc] bg-white px-3 text-sm"><option value="ALL">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><select value={reportStatusFilter} onChange={(event) => setReportStatusFilter(event.target.value)} aria-label="Filter reports by status" className="h-10 w-full rounded-lg border border-[#d9e5dc] bg-white px-3 text-sm"><option value="ALL">All statuses</option>{["REPORTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></div></div>
		</div>
		<div className="mt-8"><h2 className="mb-4 text-xl font-black text-[#173526]">Community Reports</h2>{reportActionError && <p role="alert" className="mb-4 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{reportActionError}</p>}{loading ? <p className="text-sm text-[#68776f]">Loading reports…</p> : error ? null : visibleReports.length === 0 ? <div className="sustain-card p-8 text-center text-sm text-[#68776f]">No reports match these filters.</div> : <div className="space-y-4">{visibleReports.map((report) => <div key={report.id} className="sustain-card p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="flex flex-wrap gap-2"><span className="badge badge-blue">{report.category}</span><span className="flex items-center gap-1 text-xs text-[#89958e]"><MapPin size={13} />{report.location}</span></div><h3 className="mt-3 text-lg font-extrabold text-[#173526]">{report.title}</h3><p className="mt-1 line-clamp-2 text-sm text-[#68776f]">{report.description}</p></div><div className="flex items-center gap-4"><Status status={report.status} /><button onClick={() => { setSelected(report); setReportActionError(""); }} className="flex items-center gap-1 text-sm font-bold text-[#0f5132]">Details<ArrowRight size={15} /></button></div></div><div className="mt-4 flex items-center justify-between border-t border-[#e8eee9] pt-3"><span className="text-xs text-[#87938c]">{report.comments?.length ?? 0} comments</span>{isAuthenticated ? <button onClick={() => void upvoteReport(report)} className={`flex items-center gap-2 text-sm font-bold ${report.upvoted ? "text-[#0f5132]" : "text-[#748179]"}`}><ThumbsUp size={15} />{report.upvotes ?? 0} support</button> : <span className="text-xs text-[#87938c]">{report.upvotes ?? 0} support</span>}</div></div>)}</div>}</div>
		<div className="mt-10 rounded-2xl bg-[#0f5132] p-8 text-white"><h2 className="text-2xl font-black">Your community is part of the solution.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#c0d9c8]">Small reports and local actions can become measurable community impact when people collaborate.</p></div>
		<div className="mt-10 sustain-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ea] text-[#0f5132]"><MessageCircle size={22} /></div><div><h2 className="font-extrabold text-[#173526]">Community Chat</h2><p className="mt-1 text-sm text-[#7d8a82]">Join community conversations, message members and collaborate on projects.</p></div></div>
			<Link href={isAuthenticated ? "/chat?community=1" : "/login?next=%2Fchat%3Fcommunity%3D1"} className="btn-primary shrink-0"><MessageCircle size={16} />{isAuthenticated ? "Open Community Chat" : "Sign in to chat"}</Link>
		</div>
		{showCreate && <ReportCreateModal onClose={() => setShowCreate(false)} onCreated={(report) => setReports((items) => [report, ...items])} />}
		{selected && <ModalShell title={selected.title} onClose={() => setSelected(null)}><div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1"><div className="flex flex-wrap items-center gap-2"><span className="badge badge-blue">{selected.category}</span><Status status={selected.status} /></div><p className="text-sm leading-7 text-[#68776f]">{selected.description}</p><p className="flex items-center gap-2 text-sm text-[#748179]"><MapPin size={15} />{selected.location}{typeof selected.latitude === "number" && typeof selected.longitude === "number" ? ` · ${selected.latitude}, ${selected.longitude}` : ""}</p>{selected.createdAt && <p className="text-xs text-[#87938c]">Reported {new Date(selected.createdAt).toLocaleDateString()}</p>}
			{selected.imageUrls?.length ? <div className="grid grid-cols-2 gap-3">{selected.imageUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt="Report evidence" className="h-36 w-full rounded-xl object-cover" /></a>)}</div> : null}
			{(selected.resolutionDetails || selected.reviewNote || selected.resolutionEvidenceUrl) && <div className="rounded-xl bg-[#f1f8f3] p-4"><p className="text-xs font-bold uppercase text-[#718078]">Latest update</p><p className="mt-2 whitespace-pre-wrap text-sm text-[#53635a]">{selected.resolutionDetails || selected.reviewNote}</p>{selected.resolutionEvidenceUrl && <a className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[#0f5132]" href={selected.resolutionEvidenceUrl} target="_blank" rel="noreferrer"><ImageIcon size={15} />View resolution evidence</a>}</div>}
			<div><h3 className="mb-3 text-sm font-extrabold text-[#173526]">Report history</h3><div className="space-y-2">{selected.statusHistory?.length ? selected.statusHistory.map((entry, index) => <div key={`${entry.createdAt}-${index}`} className="rounded-lg border border-[#e1ebe4] p-3"><div className="flex justify-between gap-3"><Status status={entry.status} /><span className="text-[11px] text-[#87938c]">{new Date(entry.createdAt).toLocaleString()}</span></div>{entry.note && <p className="mt-2 text-xs text-[#68776f]">{entry.note}</p>}</div>) : <p className="text-xs text-[#87938c]">No status updates have been recorded.</p>}</div></div>
			<div><h3 className="mb-3 text-sm font-extrabold text-[#173526]">Community comments</h3><div className="space-y-2">{selected.comments?.length ? selected.comments.map((comment) => <div key={comment.id} className="rounded-lg bg-[#f6f9f6] p-3"><p className="text-xs font-bold text-[#4f8060]">{comment.authorName} <span className="font-normal text-[#87938c]">· {new Date(comment.createdAt).toLocaleString()}</span></p><p className="mt-1 whitespace-pre-wrap text-sm text-[#53635a]">{comment.message}</p></div>) : <p className="text-xs text-[#87938c]">Be the first to comment.</p>}</div>{isAuthenticated ? <form onSubmit={postReportComment} className="mt-3 flex gap-2"><input value={reportComment} onChange={(event) => setReportComment(event.target.value)} maxLength={1000} placeholder="Add a comment..." className="h-10 min-w-0 flex-1 rounded-lg border border-[#d9e5dc] px-3 text-sm" /><button className="rounded-lg bg-[#0f5132] px-3 text-sm font-bold text-white">Post</button></form> : <Link href="/login?next=%2Fcommunity" className="mt-3 inline-block text-xs font-bold text-[#0f5132]">Sign in to comment</Link>}</div>
			<button onClick={() => setSelected(null)} className="btn-secondary"><X size={15} />Close</button></div></ModalShell>}
	</div></section>;
}

function Stat({ icon: Icon, value, label }: { icon: typeof MapPin; value: number; label: string }) { return <div className="sustain-card p-6"><Icon className="text-[#0f5132]" size={22} /><div className="mt-5 text-3xl font-black text-[#173526]">{value.toLocaleString()}</div><p className="mt-1 text-sm text-[#77857d]">{label}</p></div>; }
function Status({ status }: { status: CommunityReport["status"] }) { const cls = status === "RESOLVED" ? "badge badge-green" : status === "IN_PROGRESS" || status === "UNDER_REVIEW" ? "badge badge-yellow" : "badge badge-blue"; return <span className={cls}>{status.replaceAll("_", " ")}</span>; }
