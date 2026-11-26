"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, FileCheck2, MessageCircle, RefreshCw, Target, Trophy, Users } from "lucide-react";
import type { Activity, Challenge } from "../../../types";
import { getApiError, getChallenge, joinChallenge, withdrawFromChallenge } from "../../../services/platform.service";
import { useAuth } from "../../../hooks/useAuth";
import ActivitySubmitModal from "../../../components/forms/ActivitySubmitModal";

export default function ChallengeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { isAuthenticated } = useAuth();
	const [challenge, setChallenge] = useState<Challenge | null>(null);
	const [loading, setLoading] = useState(true);
	const [working, setWorking] = useState(false);
	const [error, setError] = useState("");
	const [retryKey, setRetryKey] = useState(0);
	const [showEvidence, setShowEvidence] = useState(false);

	async function refreshChallenge() {
		const result = await getChallenge(id);
		setChallenge(result);
	}

	useEffect(() => {
		let active = true;
		setLoading(true);
		setError("");
		getChallenge(id).then((item) => { if (active) setChallenge(item); }).catch((cause) => { if (active) setError(getApiError(cause, "Unable to load this challenge.")); }).finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [id, retryKey]);

	async function join() {
		if (!challenge) return;
		setWorking(true);
		setError("");
		try { await joinChallenge(challenge.id); await refreshChallenge(); }
		catch (cause) { setError(getApiError(cause, "Unable to join this challenge.")); }
		finally { setWorking(false); }
	}

	async function withdraw() {
		if (!challenge) return;
		setWorking(true);
		setError("");
		try { await withdrawFromChallenge(challenge.id); await refreshChallenge(); }
		catch (cause) { setError(getApiError(cause, "Unable to withdraw from this challenge.")); }
		finally { setWorking(false); }
	}

	if (loading) return <section className="section bg-[#f7faf7]"><div className="page-container text-sm text-[#68776f]" role="status">Loading challenge…</div></section>;
	if (!challenge) return <section className="section bg-[#f7faf7]"><div className="page-container"><div role="alert" className="sustain-card p-6 text-sm text-[#a52b36]">{error || "Challenge not found."}</div>{error && <button onClick={() => setRetryKey((value) => value + 1)} className="btn-secondary mt-4 inline-flex items-center gap-2"><RefreshCw size={15} />Try again</button>}<Link href="/challenges" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Back to challenges</Link></div></section>;

	const sdgs = challenge.sdgNumbers?.length ? challenge.sdgNumbers : [challenge.sdgId];
	const progress = challenge.myProgress;
	const status = challenge.computedStatus ?? challenge.status ?? "ACTIVE";
	const canSubmitEvidence = isAuthenticated && Boolean(challenge.joined) && (progress?.completionPercent ?? 0) < 100;
	const relatedProjectHref = `/projects?create=1&sdg=${challenge.sdgId}`;

	return <section className="section bg-[#f7faf7]"><div className="page-container max-w-5xl">
		<Link href="/challenges" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Back to challenges</Link>
		{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
		<header className="relative mb-6 overflow-hidden rounded-[2rem] bg-[#103f2b] p-6 text-white sm:p-10"><div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[30px] border-white/5" /><div className="relative"><div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${status === "ACTIVE" ? "bg-[#dff2e3] text-[#255d37]" : status === "UPCOMING" ? "bg-[#e5efff] text-[#305f9b]" : "bg-white/15 text-white"}`}>{status.toLowerCase()}</span><div className="flex items-center gap-2 text-sm text-[#d1e3d7]"><Users size={16} />{challenge.participants ?? 0} participants</div></div><div className="mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#c7efce]"><Trophy size={27} /></div><h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">{challenge.title}</h1><p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[#d1e3d7] sm:text-base">{challenge.description}</p><div className="mt-5 flex flex-wrap gap-2">{sdgs.map((number) => <Link key={number} href={`/sdgs/${number}`} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20">SDG {number}</Link>)}</div></div></header>

		<div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
			<div className="space-y-5">
				<div className="sustain-card p-6 sm:p-8"><div className="mb-5 flex items-center gap-2"><ClipboardCheck size={19} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#183829]">Challenge instructions</h2></div>{challenge.instructions?.length ? <ol className="space-y-3">{challenge.instructions.map((instruction, index) => <li key={`${index}-${instruction}`} className="flex gap-3 rounded-xl bg-[#f5f8f5] p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e3f2e6] text-xs font-black text-[#0f5132]">{index + 1}</span><span className="text-sm leading-6 text-[#52645a]">{instruction}</span></li>)}</ol> : <p className="text-sm text-[#77847d]">Follow the challenge description and submit evidence of your work.</p>}{challenge.requirements?.length ? <><h3 className="mb-3 mt-7 text-sm font-extrabold text-[#183829]">Completion requirements</h3><ul className="space-y-2">{challenge.requirements.map((requirement) => <li key={requirement} className="flex items-start gap-2 text-sm leading-6 text-[#52645a]"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#49834f]" />{requirement}</li>)}</ul></> : null}</div>
				<div className="sustain-card p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#829088]">Your participation</p><h2 className="mt-1 text-lg font-extrabold text-[#183829]">Verified completion progress</h2></div><Target size={21} className="text-[#0f5132]" /></div>{!isAuthenticated ? <p className="mt-4 text-sm leading-6 text-[#718278]">Sign in and join this challenge to track submissions and progress.</p> : !challenge.joined ? <p className="mt-4 text-sm leading-6 text-[#718278]">Join the challenge to submit evidence and track verified progress.</p> : <><div className="mt-5 flex items-end justify-between gap-3"><p className="text-3xl font-black text-[#0f5132]">{progress?.completionPercent ?? 0}%</p><p className="text-right text-xs text-[#77847d]">{progress?.verified ?? 0} verified of {progress?.requiredSubmissions ?? challenge.requiredSubmissions ?? 1} required submissions</p></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e4ede7]"><div className="h-full rounded-full bg-[#4f9957] transition-all" style={{ width: `${Math.min(100, Math.max(0, progress?.completionPercent ?? 0))}%` }} /></div><div className="mt-4 grid grid-cols-2 gap-3"><ProgressMetric label="Submitted" value={progress?.submitted ?? 0} /><ProgressMetric label="Awaiting review" value={progress?.pending ?? 0} /></div></>}</div>
			</div>
			<aside className="space-y-5">
				<div className="sustain-card p-6 sm:p-7"><h2 className="font-extrabold text-[#183829]">Challenge details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><DetailMetric label="Difficulty" value={challenge.difficulty ?? "Not set"} /><DetailMetric label="Impact points" value={`${challenge.points} points after verification`} /><DetailMetric label="Starts" value={formatDate(challenge.startDate)} /><DetailMetric label="Ends" value={formatDate(challenge.endDate ?? challenge.deadline)} /><DetailMetric label="Participants" value={String(challenge.participants ?? 0)} /></div></div>
				<div className="rounded-2xl bg-[#0f5132] p-6 text-white sm:p-7"><FileCheck2 size={24} /><h2 className="mt-4 text-xl font-black">Take your next step</h2><p className="mt-2 text-sm leading-6 text-[#c1d9c8]">Join, submit photo or link evidence, and have your work reviewed by the SustainX team.</p><div className="mt-5 grid gap-3">{challenge.joined ? <><button onClick={() => setShowEvidence(true)} disabled={!canSubmitEvidence} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0f5132] disabled:opacity-60">{progress?.completionPercent === 100 ? "Challenge completed" : "Submit evidence"}{progress?.completionPercent !== 100 && <ArrowRight size={16} />}</button>{progress?.completionPercent === 100 && <Link href="/certificates" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white">View certificates<ArrowRight size={16} /></Link>}<Link href={`/chat?challengeId=${encodeURIComponent(challenge.id)}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white"><MessageCircle size={16} />Open challenge discussion</Link>{status === "ACTIVE" && <button onClick={() => void withdraw()} disabled={working} className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white/80 hover:bg-white/10 disabled:opacity-60">{working ? "Updating participation…" : "Withdraw from challenge"}</button>}</> : isAuthenticated ? status === "ACTIVE" ? <button onClick={() => void join()} disabled={working} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0f5132] disabled:opacity-60">{working ? "Joining…" : "Join challenge"}<ArrowRight size={16} /></button> : <p className="rounded-xl bg-white/10 p-3 text-sm">This challenge is {status.toLowerCase()} and is not accepting new participants.</p> : <Link href={`/login?next=${encodeURIComponent(`/challenges/${challenge.id}`)}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0f5132]">Sign in to join<ArrowRight size={16} /></Link>}<Link href={isAuthenticated ? relatedProjectHref : `/login?next=${encodeURIComponent(relatedProjectHref)}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white">Create a related project<ArrowRight size={16} /></Link></div></div>
			</aside>
		</div>
		{showEvidence && <ActivitySubmitModal defaultSdgId={challenge.sdgId} defaultChallengeId={challenge.id} defaultCategory="Challenge completion" onClose={() => setShowEvidence(false)} onCreated={(_activity: Activity) => { void refreshChallenge(); }} />}
	</div></section>;
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
	return <div className="rounded-xl bg-[#f5f8f5] p-3"><p className="text-xs text-[#849087]">{label}</p><p className="mt-1 text-lg font-black text-[#173526]">{value.toLocaleString()}</p></div>;
}

function DetailMetric({ label, value }: { label: string; value: string }) {
	return <div className="flex items-start justify-between gap-3 border-b border-[#edf1ee] pb-3 last:border-0 last:pb-0"><p className="text-xs text-[#849087]">{label}</p><p className="text-right text-sm font-bold text-[#405349]">{value}</p></div>;
}

function formatDate(value?: string) {
	if (!value) return "Not set";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
