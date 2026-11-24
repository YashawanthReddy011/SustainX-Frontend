"use client";

import { MapPin } from "lucide-react";
import type { Activity } from "../../types";

export default function ImpactMap({ activities }: { activities: Activity[] }) {
	const located = activities.filter((activity) => typeof activity.latitude === "number" && typeof activity.longitude === "number");
	return <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-[#dce7df] bg-[#e9f2e9]">
		<div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(#bfd4c4 1px, transparent 1px), linear-gradient(90deg, #bfd4c4 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
		<div className="absolute left-[10%] top-[12%] h-[120px] w-[230px] rounded-[45%] bg-[#c9dfc8] opacity-80" /><div className="absolute right-[7%] top-[38%] h-[160px] w-[250px] rounded-[50%] bg-[#c6dfc8] opacity-80" /><div className="absolute bottom-[5%] left-[30%] h-[130px] w-[300px] rounded-[45%] bg-[#d2e5c9] opacity-70" />
		<div className="absolute left-5 top-5 z-10 rounded-xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur"><p className="text-sm font-extrabold text-[#173526]">SustainX Impact Map</p><p className="mt-1 text-xs text-[#708078]">Verified actions with submitted coordinates</p></div>
		{located.map((activity) => { const left = ((activity.longitude! + 180) / 360) * 100; const top = ((90 - activity.latitude!) / 180) * 100; return <div key={activity.id} className="group absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%` }}><div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#0f5132] text-white shadow-lg"><MapPin size={17} /></div><div className="absolute bottom-full left-1/2 mb-3 hidden w-52 -translate-x-1/2 rounded-xl bg-[#082f1e] p-3 text-white shadow-xl group-hover:block"><p className="text-xs font-extrabold">{activity.title}</p><p className="mt-1 text-[11px] text-[#b7d2c0]">{activity.location} · SDG {activity.sdgId}</p></div></div>; })}
		{located.length === 0 && <div className="absolute inset-0 flex items-center justify-center p-6"><div className="max-w-sm rounded-2xl bg-white/90 p-6 text-center shadow-lg"><MapPin size={24} className="mx-auto text-[#0f5132]" /><p className="mt-3 text-sm font-bold text-[#173526]">No verified activities have map coordinates yet.</p><p className="mt-2 text-xs leading-5 text-[#708078]">Contributors can add latitude and longitude when they submit an activity. Verified locations will appear here.</p></div></div>}
		<div className="absolute bottom-5 left-5 rounded-xl bg-white/90 px-4 py-3 shadow-md backdrop-blur"><div className="flex items-center gap-2 text-xs font-bold text-[#53635a]"><MapPin size={14} className="text-[#0f5132]" />{located.length} mapped activities</div></div>
	</div>;
}
