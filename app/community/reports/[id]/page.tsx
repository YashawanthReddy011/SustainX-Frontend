"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, MapPin, MessageCircle, ThumbsUp } from "lucide-react";
import { useAuth } from "../../../../hooks/useAuth";
import { addReportComment, getApiError, getCommunityReport, toggleReportUpvote } from "../../../../services/platform.service";
import type { CommunityReport } from "../../../../types";

export default function CommunityReportDetailsPage() {
	const params = useParams<{ id: string }>();
	const { isAuthenticated } = useAuth();
	const [report, setReport] = useState<CommunityReport | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [comment, setComment] = useState("");
	const [working, setWorking] = useState(false);
	const [notice, setNotice] = useState("");

	useEffect(() => {
		let active = true;
		getCommunityReport(params.id).then((value) => { if (active) setReport(value); }).catch((cause) => { if (active) setError(getApiError(cause, "Unable to load this report.")); }).finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [params.id]);

	async function supportReport() {
		if (!report || !isAuthenticated) return;
		setWorking(true); setError("");
		try { const result = await toggleReportUpvote(report.id); setReport((current) => current ? { ...current, ...result } : current); }
		catch (cause) { setError(getApiError(cause, "Unable to support this report.")); }
		finally { setWorking(false); }
	}

	async function postComment(event: FormEvent<HTMLFormElement>) {
		event.preventDefault(); if (!report || !comment.trim()) return;
		setWorking(true); setError("");
		try {
			const item = await addReportComment(report.id, comment.trim());
			setReport((current) => current ? { ...current, comments: [...(current.comments ?? []), item] } : current);
			setComment(""); setNotice("Your comment was added.");
		} catch (cause) { setError(getApiError(cause, "Unable to add your comment.")); }
		finally { setWorking(false); }
	}

	if (loading) return <section className="section"><div className="page-container text-sm text-[#68776f]" role="status">Loading report...</div></section>;
	if (error && !report) return <section className="section"><div className="page-container"><p role="alert" className="sustain-card p-6 text-sm text-[#a52b36]">{error}</p><Link href="/community" className="btn-secondary mt-4">Back to Community</Link></div></section>;
	if (!report) return <section className="section"><div className="page-container">Report not found.</div></section>;
	const statusLabel = labelStatus(report.status);

	return <section className="section bg-[#f7faf7]"><div className="page-container max-w-5xl"><Link href="/community" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Back to Community reports</Link>{error && <p role="alert" className="mb-4 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}{notice && <p role="status" className="mb-4 rounded-xl bg-[#e8f5eb] p-3 text-sm text-[#28643a]">{notice}</p>}
		<div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><article className="sustain-card p-6 sm:p-8"><div className="flex flex-wrap items-center gap-2"><Status status={report.status} /><span className="badge badge-blue">{report.category}</span></div><h1 className="mt-4 text-3xl font-black text-[#173526]">{report.title}</h1><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#58685e]">{report.description}</p><p className="mt-5 flex items-center gap-2 text-sm text-[#718078]"><MapPin size={16} />{report.location}{typeof report.latitude === "number" && typeof report.longitude === "number" ? ` · ${report.latitude}, ${report.longitude}` : ""}</p>{report.createdAt && <p className="mt-2 text-xs text-[#87938c]">Submitted {new Date(report.createdAt).toLocaleString()}</p>}
			{report.imageUrls?.length ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{report.imageUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt="Community report evidence" className="h-48 w-full rounded-xl object-cover" /></a>)}</div> : null}
			<div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7eee9] pt-4"><span className="text-xs text-[#87938c]">{report.comments?.length ?? 0} comments</span>{isAuthenticated ? <button type="button" onClick={() => void supportReport()} disabled={working} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${report.upvoted ? "bg-[#e7f5ea] text-[#0f5132]" : "border border-[#d9e5dc] text-[#65736c]"}`}><ThumbsUp size={15} />{report.upvoted ? "Supported" : "Support this report"} · {report.upvotes ?? 0}</button> : <Link href={`/login?next=${encodeURIComponent(`/community/reports/${report.id}`)}`} className="text-sm font-bold text-[#0f5132]">Sign in to support · {report.upvotes ?? 0}</Link>}</div>
		</article>
		<aside className="space-y-6"><section className="sustain-card p-6"><div className="mb-4 flex items-center gap-2"><Clock3 size={19} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Report timeline</h2></div><div className="space-y-4">{report.statusHistory?.length ? report.statusHistory.map((entry, index) => <div key={`${entry.createdAt}-${index}`} className="border-l-2 border-[#b8d8c0] py-1 pl-4"><p className="text-sm font-bold text-[#405349]">{labelStatus(entry.status)}</p><p className="mt-1 text-[11px] text-[#87938c]">{entry.changedByName ?? "Community member"} · {new Date(entry.createdAt).toLocaleString()}</p>{entry.note && <p className="mt-2 text-xs leading-5 text-[#68776f]">{entry.note}</p>}</div>) : <p className="text-sm text-[#87938c]">No timeline updates yet.</p>}</div>{report.resolutionDetails && <div className="mt-5 rounded-xl bg-[#f1f8f3] p-4"><p className="text-xs font-bold uppercase text-[#718078]">Resolution details</p><p className="mt-2 whitespace-pre-wrap text-sm text-[#53635a]">{report.resolutionDetails}</p>{report.resolutionEvidenceUrl && <a href={report.resolutionEvidenceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-[#0f5132] underline">View resolution evidence</a>}</div>}</section>
			{report.sdgNumbers?.length ? <section className="sustain-card p-6"><h2 className="font-extrabold text-[#173526]">Related Sustainable Development Goals</h2><div className="mt-3 flex flex-wrap gap-2">{report.sdgNumbers.map((number) => <Link key={number} href={`/sdgs/${number}`} className="badge badge-green hover:underline">SDG {number}</Link>)}</div><div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-[#0f5132]"><Link href={`/challenges?sdg=${report.sdgNumbers[0]}`}>Find related challenges →</Link><Link href={`/projects?sdg=${report.sdgNumbers[0]}&create=1`}>Start an impact project →</Link></div></section> : null}
		</aside></div>
		<section className="sustain-card mt-6 p-6"><div className="mb-4 flex items-center gap-2"><MessageCircle size={19} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Community discussion</h2></div><div className="space-y-3">{report.comments?.length ? report.comments.map((item) => <div key={item.id} className="rounded-xl bg-[#f6faf7] p-4"><p className="text-xs font-bold text-[#4f8060]">{item.authorName} · {new Date(item.createdAt).toLocaleString()}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#53635a]">{item.message}</p></div>) : <p className="text-sm text-[#87938c]">No comments yet. Add a constructive update or question.</p>}</div>{isAuthenticated ? <form onSubmit={postComment} className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} placeholder="Add a comment..." className="h-11 min-w-0 flex-1 rounded-xl border border-[#d9e5dc] px-3 text-sm" /><button disabled={working || !comment.trim()} className="btn-primary justify-center">Post comment</button></form> : <Link href={`/login?next=${encodeURIComponent(`/community/reports/${report.id}`)}`} className="mt-4 inline-block text-sm font-bold text-[#0f5132]">Sign in to comment</Link>}</section>
	</div></section>;
}

function labelStatus(status: string) { return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function Status({ status }: { status: CommunityReport["status"] }) { const cls = status === "RESOLVED" ? "badge badge-green" : status === "REJECTED" ? "badge badge-red" : status === "SUBMITTED" ? "badge badge-blue" : "badge badge-yellow"; return <span className={cls}>{labelStatus(status)}</span>; }
