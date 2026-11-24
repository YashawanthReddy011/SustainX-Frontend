"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Leaf, TreePine, Recycle, Droplets, Bird, Plus, ArrowRight } from "lucide-react";
import ActivitySubmitModal from "../../components/forms/ActivitySubmitModal";
import type { Activity, Project } from "../../types";
import { getApiError, getProjects, getVerifiedActivities } from "../../services/platform.service";
import { useAuth } from "../../hooks/useAuth";

const actionTypes = [
	{ title: "Tree Plantation", description: "Plant and maintain native trees and document their growth.", sdgId: 15, icon: TreePine },
	{ title: "Water Conservation", description: "Record water-saving actions and support responsible water use.", sdgId: 6, icon: Droplets },
	{ title: "Waste Reduction", description: "Track segregation, reuse and waste reduction activities.", sdgId: 12, icon: Recycle },
	{ title: "Biodiversity", description: "Document local species and create biodiversity observations.", sdgId: 15, icon: Bird },
];

export default function EarthPage() {
	const [activities, setActivities] = useState<Activity[]>([]); const [projects, setProjects] = useState<Project[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showActivity, setShowActivity] = useState(false); const [category, setCategory] = useState("Tree Plantation");
	const { isAuthenticated } = useAuth();
	useEffect(() => { Promise.all([getVerifiedActivities(), getProjects()]).then(([a, p]) => { setActivities(a); setProjects(p); }).catch((e) => setError(getApiError(e, "Unable to load environmental impact data."))).finally(() => setLoading(false)); }, []);
	const environmental = useMemo(() => activities.filter((item) => [6, 7, 12, 13, 14, 15].includes(item.sdgId)), [activities]);
	function openActivity(type: string) { setCategory(type); setShowActivity(true); }
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="mb-12 overflow-hidden rounded-[28px] bg-[#0b4129] p-8 text-white md:p-12"><div className="grid items-center gap-10 md:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a7cdb2]"><Leaf size={15} />ECOGUARD</div><h1 className="mt-5 max-w-3xl text-4xl font-black md:text-6xl">Protect the systems that protect us.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-[#bed7c7]">Build environmental awareness through tree plantation, biodiversity records, water conservation and responsible consumption.</p>{isAuthenticated ? <button onClick={() => openActivity("Environmental Action")} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]"><Plus size={16} />Add Environmental Activity</button> : <Link href="/login?next=%2Fearth" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]"><Plus size={16} />Sign in to add an activity</Link>}</div><div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10"><Leaf size={65} className="text-[#8dca91]" /></div></div></div>
		{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
		<div className="grid gap-5 sm:grid-cols-2">{actionTypes.map((action) => { const Icon = action.icon; const related = activities.filter((item) => item.category?.toLowerCase() === action.title.toLowerCase()); const count = related.reduce((sum, item) => sum + (item.quantity ?? 1), 0); return <div key={action.title} className="sustain-card sustain-card-hover p-6"><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f4e9] text-[#0f5132]"><Icon size={23} /></div><div className="text-right"><div className="text-xl font-black text-[#173526]">{loading ? "…" : count.toLocaleString()}</div><div className="text-[11px] font-semibold text-[#89968f]">verified units</div></div></div><h2 className="mt-6 text-xl font-black text-[#173526]">{action.title}</h2><p className="mt-2 text-sm leading-6 text-[#68776f]">{action.description}</p><div className="mt-5 flex items-center gap-5"><Link href={`/sdgs/${action.sdgId}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]">Explore SDG {action.sdgId}<ArrowRight size={15} /></Link>{isAuthenticated && <button onClick={() => openActivity(action.title)} className="text-sm font-bold text-[#0f5132]">Log action</button>}</div></div>; })}</div>
		<div className="mt-10 grid gap-5 lg:grid-cols-3"><Metric value={loading ? "…" : "6"} title="Environmental SDGs" description="SDGs 6, 7, 12, 13, 14 and 15." /><Metric value={loading ? "…" : environmental.length.toLocaleString()} title="Verified Actions" description="Approved environmental activity submissions." /><Metric value={loading ? "…" : projects.filter((p) => [6, 7, 12, 13, 14, 15].includes(p.sdgId)).length.toLocaleString()} title="Environmental Projects" description="Projects connected to environmental SDGs." /></div>
		{showActivity && <ActivitySubmitModal defaultSdgId={category === "Water Conservation" ? 6 : category === "Waste Reduction" ? 12 : 15} defaultCategory={category} onClose={() => setShowActivity(false)} onCreated={(activity) => { setActivities((items) => [activity, ...items]); }} />}
	</div></section>;
}

function Metric({ value, title, description }: { value: string; title: string; description: string }) { return <div className="sustain-card p-6"><div className="text-3xl font-black text-[#0f5132]">{value}</div><p className="mt-2 text-sm font-bold text-[#5e6d65]">{title}</p><p className="mt-2 text-xs leading-5 text-[#87938d]">{description}</p></div>; }
