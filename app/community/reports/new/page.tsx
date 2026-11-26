"use client";

import Link from "next/link";
import { ArrowLeft, FilePlus2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import ReportCreateForm from "../../../../components/forms/ReportCreateForm";
import { useAuth } from "../../../../hooks/useAuth";

export default function CreateCommunityReportPage() {
	const router = useRouter();
	const { isAuthenticated, loading } = useAuth();
	return <section className="section bg-[#f7faf7]"><div className="page-container max-w-3xl"><Link href="/community" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Back to Community</Link><header className="mb-6"><div className="section-label"><Users size={14} />CIVICCONNECT</div><h1 className="mt-4 text-3xl font-black text-[#153426] sm:text-4xl">Report a community issue</h1><p className="mt-2 text-sm leading-6 text-[#68776f]">Give your community a clear starting point to review and respond.</p></header><div className="sustain-card p-5 sm:p-8">{loading ? <p role="status" className="text-sm text-[#68776f]">Checking your sign-in...</p> : isAuthenticated ? <ReportCreateForm onCancel={() => router.push("/community")} onCreated={(report) => router.push(`/community/reports/${encodeURIComponent(report.id)}?submitted=1`)} /> : <div className="py-6 text-center"><FilePlus2 size={30} className="mx-auto text-[#0f5132]" /><h2 className="mt-4 text-xl font-black text-[#173526]">Sign in to submit a report</h2><p className="mt-2 text-sm text-[#68776f]">Your report will be linked to your account so you can track its review.</p><Link href={`/login?next=${encodeURIComponent("/community/reports/new")}`} className="btn-primary mt-5">Sign in to report</Link></div>}</div></div></section>;
}
