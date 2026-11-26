"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, FolderKanban, Leaf, Lightbulb, Plus, RefreshCw, Target, Trophy } from "lucide-react";
import { getSDG } from "../../../services/sdg.service";
import { useAuth } from "../../../hooks/useAuth";
import type { SDG } from "../../../types";
import ActivitySubmitModal from "../../../components/forms/ActivitySubmitModal";

export default function SDGDetailPage() {
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const [data, setData] = useState<SDG | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [retryKey, setRetryKey] = useState(0);
	const [showActivity, setShowActivity] = useState(false);
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (!Number.isInteger(id) || id < 1 || id > 17) {
			setError("This SDG number is not valid.");
			setLoading(false);
			return;
		}
		let active = true;
		setLoading(true);
		setError("");
		getSDG(id)
			.then((result) => { if (active) setData(result); })
			.catch(() => { if (active) { setData(null); setError("This SDG could not be loaded. Check your connection and try again."); } })
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [id, retryKey]);

	if (loading) return <section className="section bg-[#f7faf7]"><div className="page-container text-sm text-[#68776f]">Loading SDG…</div></section>;
	if (error || !data) return <section className="section bg-[#f7faf7]"><div className="page-container"><div role="alert" className="sustain-card p-6 text-sm text-[#a52b36]">{error || "SDG not found."}</div>{error && <button onClick={() => setRetryKey((value) => value + 1)} className="btn-secondary mt-4 inline-flex items-center gap-2"><RefreshCw size={15} />Try again</button>}<Link href="/sdgs" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Back to all goals</Link></div></section>;

	const actions = data.actions?.length ? data.actions : ["Learn about this goal", "Plan a local activity", "Share results with your community"];
	const color = data.color ?? "#0f5132";

	return <section className="section bg-[#f7faf7]"><div className="page-container">
		<Link href="/sdgs" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Back to all goals</Link>
		<header className="relative mb-7 overflow-hidden rounded-[2rem] bg-[#103f2b] p-6 text-white sm:p-10">
			<div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[30px] border-white/5" />
			<div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
				<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg" style={{ backgroundColor: color }}>{data.id}</div>
				<div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#c7efce]">Sustainable Development Goal {data.id}</span>{data.category && <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">{data.category}</span>}</div><h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{data.title}</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[#d1e3d7]">{data.description ?? data.shortDescription}</p></div>
			</div>
		</header>

		<div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
			<div className="space-y-5">
				<div className="sustain-card p-6 sm:p-8"><div className="mb-5 flex items-center gap-2"><Lightbulb size={19} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#183829]">Ideas for local action</h2></div><div className="grid gap-3 sm:grid-cols-2">{actions.map((action) => <div key={action} className="flex items-start gap-3 rounded-xl bg-[#f1f8f3] p-4"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#3e8b4e]" /><span className="text-sm font-semibold leading-6 text-[#43554b]">{action}</span></div>)}</div></div>
				<div className="sustain-card p-6 sm:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-wider text-[#829088]">UN framework</p><h2 className="mt-1 text-lg font-extrabold text-[#183829]">Official global targets</h2></div><Target size={21} className="text-[#0f5132]" /></div><p className="mt-4 text-3xl font-black text-[#0f5132]">{typeof data.targetCount === "number" ? data.targetCount : "—"}</p><p className="mt-2 text-sm leading-6 text-[#718278]">Official targets for this goal. This count is separate from SustainX activities and verified actions.</p></div>
			</div>
			<aside className="space-y-5">
				<div className="sustain-card p-6 sm:p-7"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><Target className="text-[#0f5132]" size={22} /><h2 className="font-extrabold text-[#183829]">SustainX activity</h2></div><span className="text-lg font-black text-[#0f5132]">{data.progress ?? 0}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e4ede7]"><div className="h-full rounded-full bg-[#4f9957]" style={{ width: `${Math.min(100, Math.max(0, data.progress ?? 0))}%` }} /></div><p className="mt-3 text-xs leading-5 text-[#7d8a82]">{data.completedActions ?? 0} verified of {data.totalActions ?? 0} submitted platform actions</p></div>
				<div className="rounded-2xl bg-[#0f5132] p-6 text-white sm:p-7"><BookOpen size={24} /><h2 className="mt-4 text-xl font-black">Turn this goal into action</h2><p className="mt-2 text-sm leading-6 text-[#c1d9c8]">Submit a SustainX activity and contribute to verified community impact.</p>{isAuthenticated ? <button onClick={() => setShowActivity(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0f5132]"><Plus size={16} />Submit an activity</button> : <Link href={`/login?next=%2Fsdgs%2F${data.id}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0f5132]">Sign in to contribute<ArrowRight size={16} /></Link>}</div>
			</aside>
		</div>

		<section className="mt-9"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-widest text-[#789087]">Explore SustainX</p><h2 className="mt-1 text-2xl font-black text-[#153426]">Related modules</h2></div><div className="grid gap-4 md:grid-cols-3">
			<ModuleLink href="/ecoguard" icon={Leaf} title="EcoGuard" description="Explore tree planting, water conservation and biodiversity activities." />
			<ModuleLink href={`/challenges?sdg=${data.id}`} icon={Trophy} title="Challenges" description="Find active challenges connected to this goal." />
			<ModuleLink href={`/projects?sdg=${data.id}`} icon={FolderKanban} title="Impact projects" description="Discover community projects advancing this goal." />
		</div></section>

		<div className="mt-8 grid gap-5 lg:grid-cols-3">
			<RelatedList title="Related Challenges" items={data.relatedChallenges?.map((item) => ({ name: item.title, href: `/challenges/${encodeURIComponent(item.id)}` })) ?? []} empty="No challenges connected yet." />
			<RelatedList title="Related Projects" items={data.relatedProjects?.map((item) => ({ name: item.title, href: `/projects/${encodeURIComponent(item.id)}` })) ?? []} empty="No projects connected yet." />
			<RelatedList title="Verified Activities" items={data.relatedActivities?.map((item) => ({ name: item.title, href: "/impact-map" })) ?? []} empty="No verified activities yet." />
		</div>
		{showActivity && <ActivitySubmitModal defaultSdgId={data.id} onClose={() => setShowActivity(false)} onCreated={() => {}} />}
	</div></section>;
}

function ModuleLink({ href, icon: Icon, title, description }: { href: string; icon: typeof Leaf; title: string; description: string }) {
	return <Link href={href} className="sustain-card sustain-card-hover group flex items-start gap-4 p-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f5ea] text-[#0f5132]"><Icon size={20} /></span><span><span className="flex items-center gap-2 font-extrabold text-[#173526]">{title}<ArrowRight size={15} className="transition group-hover:translate-x-1" /></span><span className="mt-1 block text-sm leading-6 text-[#718278]">{description}</span></span></Link>;
}

function RelatedList({ title, items, empty }: { title: string; items: Array<{ name: string; href: string }>; empty: string }) {
	return <div className="sustain-card p-6"><h2 className="font-extrabold text-[#183829]">{title}</h2><div className="mt-4 space-y-2">{items.length ? items.map((item) => <Link key={item.name} href={item.href} className="block rounded-xl bg-[#f2f8f4] px-4 py-3 text-sm font-bold text-[#405349] hover:text-[#0f5132]">{item.name}<ArrowRight size={14} className="float-right mt-0.5" /></Link>) : <p className="text-sm text-[#87938d]">{empty}</p>}</div></div>;
}
