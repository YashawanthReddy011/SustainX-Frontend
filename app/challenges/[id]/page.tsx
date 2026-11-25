"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, MessageCircle, Trophy, Users } from "lucide-react";
import type { Challenge } from "../../../types";
import { getApiError, getChallenge, joinChallenge } from "../../../services/platform.service";
import { useAuth } from "../../../hooks/useAuth";

export default function ChallengeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { isAuthenticated } = useAuth();
	const [challenge, setChallenge] = useState<Challenge | null>(null);
	const [loading, setLoading] = useState(true);
	const [working, setWorking] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		getChallenge(id).then((item) => {
			if (active) setChallenge(item);
		}).catch((cause) => {
			if (active) setError(getApiError(cause, "Unable to load this challenge."));
		}).finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [id]);

	async function join() {
		if (!challenge) return;
		setWorking(true);
		setError("");
		try {
			const result = await joinChallenge(challenge.id);
			setChallenge((current) => current ? { ...current, joined: result.joined, participants: result.participants } : current);
		} catch (cause) {
			setError(getApiError(cause, "Unable to join this challenge."));
		} finally {
			setWorking(false);
		}
	}

	if (loading) return <section className="section bg-[#f7faf7]"><div className="page-container text-sm text-[#68776f]" role="status">Loading challenge…</div></section>;
	if (!challenge) return <section className="section bg-[#f7faf7]"><div className="page-container"><p role="alert" className="sustain-card p-6 text-sm text-[#a52b36]">{error || "Challenge not found."}</p>{error && <button onClick={() => window.location.reload()} className="btn-secondary mt-4">Try again</button>}<Link href="/challenges" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]">Back to challenges</Link></div></section>;

	const relatedProjectHref = `/projects?create=1&sdgId=${challenge.sdgId}`;
	const signInForProjectHref = `/login?next=${encodeURIComponent(relatedProjectHref)}`;

	return (
		<section className="section bg-[#f7faf7]"><div className="page-container max-w-4xl">
			<Link href="/challenges" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]">Back to challenges</Link>
			{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
			<article className="sustain-card p-7 sm:p-10">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Link href={`/sdgs/${challenge.sdgId}`} className="badge badge-green hover:underline">Explore SDG {challenge.sdgId}</Link>
					<div className="flex items-center gap-2 text-sm text-[#708078]"><Users size={16} />{challenge.participants ?? 0} participants</div>
				</div>
				<div className="mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f4e9] text-[#0f5132]"><Trophy size={26} /></div>
				<h1 className="mt-5 text-3xl font-black text-[#173526] sm:text-4xl">{challenge.title}</h1>
				<p className="mt-4 whitespace-pre-wrap text-base leading-8 text-[#68776f]">{challenge.description}</p>
				<div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Reward" value={`${challenge.points ?? 0} points`} /><Metric label="Duration" value={`${challenge.durationDays ?? 0} days`} /><Metric label="Deadline" value={challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : "Open"} /></div>
				<div className="mt-8 flex flex-wrap gap-3">
					{challenge.joined && isAuthenticated
						? <Link href={`/chat?challengeId=${encodeURIComponent(challenge.id)}`} className="btn-primary"><MessageCircle size={16} />Open challenge discussion</Link>
						: isAuthenticated
							? <button onClick={() => void join()} disabled={working} className="btn-primary disabled:opacity-60">{working ? "Joining…" : "Join challenge"}<ArrowRight size={16} /></button>
							: <Link href={`/login?next=${encodeURIComponent(`/challenges/${challenge.id}`)}`} className="btn-primary">Sign in to join<ArrowRight size={16} /></Link>}
					<Link href={isAuthenticated ? relatedProjectHref : signInForProjectHref} className="btn-secondary">Create a related project<ArrowRight size={16} /></Link>
				</div>
			</article>
		</div></section>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return <div className="rounded-xl bg-[#f5f8f5] p-4"><p className="text-xs text-[#849087]">{label}</p><p className="mt-1 font-black text-[#173526]">{value}</p></div>;
}
