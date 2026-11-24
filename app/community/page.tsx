"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MapPin, AlertTriangle, Plus, ArrowRight, CheckCircle2, X } from "lucide-react";
import type { CommunityReport } from "../../types";
import { getApiError, getReports } from "../../services/platform.service";
import { useAuth } from "../../hooks/useAuth";
import ReportCreateModal from "../../components/forms/ReportCreateModal";
import ModalShell from "../../components/forms/ModalShell";

export default function CommunityPage() {
	const [reports, setReports] = useState<CommunityReport[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showCreate, setShowCreate] = useState(false); const [selected, setSelected] = useState<CommunityReport | null>(null);
	const { isAuthenticated } = useAuth();
	useEffect(() => { getReports().then(setReports).catch((e) => setError(getApiError(e, "Unable to load community reports. Check that the API is running."))).finally(() => setLoading(false)); }, []);
	const underReview = reports.filter((report) => ["UNDER_REVIEW", "IN_PROGRESS"].includes(report.status)).length;
	const resolved = reports.filter((report) => report.status === "RESOLVED").length;
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="section-label"><Users size={14} />CIVICCONNECT</div><h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">Community Development</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">Connect communities with action. Report issues, support local initiatives and collaborate on solutions.</p></div>{isAuthenticated ? <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={17} />Report an Issue</button> : <Link href="/login?next=%2Fcommunity" className="btn-primary"><Plus size={17} />Sign in to report</Link>}</div>
		{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
		<div className="grid gap-5 md:grid-cols-3"><Stat icon={MapPin} value={reports.length} label="Community Reports" /><Stat icon={AlertTriangle} value={underReview} label="Issues Under Review" /><Stat icon={CheckCircle2} value={resolved} label="Resolved Issues" /></div>
		<div className="mt-10"><h2 className="mb-4 text-xl font-black text-[#173526]">Community Reports</h2>{loading ? <p className="text-sm text-[#68776f]">Loading reports…</p> : reports.length === 0 ? <div className="sustain-card p-8 text-center text-sm text-[#68776f]">No reports yet. Submit a local issue to start a community response.</div> : <div className="space-y-4">{reports.map((report) => <div key={report.id} className="sustain-card p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="flex flex-wrap gap-2"><span className="badge badge-blue">{report.category}</span><span className="flex items-center gap-1 text-xs text-[#89958e]"><MapPin size={13} />{report.location}</span></div><h3 className="mt-3 text-lg font-extrabold text-[#173526]">{report.title}</h3></div><div className="flex items-center gap-4"><Status status={report.status} /><button onClick={() => setSelected(report)} className="flex items-center gap-1 text-sm font-bold text-[#0f5132]">View<ArrowRight size={15} /></button></div></div></div>)}</div>}</div>
		<div className="mt-10 rounded-2xl bg-[#0f5132] p-8 text-white"><h2 className="text-2xl font-black">Your community is part of the solution.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#c0d9c8]">Small reports and local actions can become measurable community impact when people collaborate.</p></div>
		{showCreate && <ReportCreateModal onClose={() => setShowCreate(false)} onCreated={(report) => setReports((items) => [report, ...items])} />}
		{selected && <ModalShell title={selected.title} onClose={() => setSelected(null)}><div className="space-y-4"><div className="flex flex-wrap items-center gap-2"><span className="badge badge-blue">{selected.category}</span><Status status={selected.status} /></div><p className="text-sm leading-7 text-[#68776f]">{selected.description}</p><p className="flex items-center gap-2 text-sm text-[#748179]"><MapPin size={15} />{selected.location}</p>{selected.createdAt && <p className="text-xs text-[#87938c]">Reported {new Date(selected.createdAt).toLocaleDateString()}</p>}{selected.reviewNote && <div className="rounded-xl bg-[#f5f8f5] p-4"><p className="text-xs font-bold uppercase text-[#87938c]">Update</p><p className="mt-2 text-sm text-[#53635a]">{selected.reviewNote}</p></div>}<button onClick={() => setSelected(null)} className="btn-secondary"><X size={15} />Close</button></div></ModalShell>}
	</div></section>;
}

function Stat({ icon: Icon, value, label }: { icon: typeof MapPin; value: number; label: string }) { return <div className="sustain-card p-6"><Icon className="text-[#0f5132]" size={22} /><div className="mt-5 text-3xl font-black text-[#173526]">{value.toLocaleString()}</div><p className="mt-1 text-sm text-[#77857d]">{label}</p></div>; }
function Status({ status }: { status: CommunityReport["status"] }) { const cls = status === "RESOLVED" ? "badge badge-green" : status === "IN_PROGRESS" || status === "UNDER_REVIEW" ? "badge badge-yellow" : "badge badge-blue"; return <span className={cls}>{status.replaceAll("_", " ")}</span>; }
