"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, MapPin, Activity } from "lucide-react";
import ImpactMap from "../../components/map";
import type { Activity as ActivityType } from "../../types";
import { getApiError, getVerifiedActivities } from "../../services/platform.service";

export default function ImpactMapPage() {
	const [activities, setActivities] = useState<ActivityType[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
	useEffect(() => { getVerifiedActivities().then(setActivities).catch((e) => setError(getApiError(e, "Unable to load impact locations."))).finally(() => setLoading(false)); }, []);
	const locations = useMemo(() => new Set(activities.map((activity) => activity.location?.trim()).filter(Boolean)).size, [activities]); const sdgs = useMemo(() => new Set(activities.map((activity) => activity.sdgId)).size, [activities]);
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="mb-8"><div className="section-label"><Map size={14} />IMPACT VISUALIZATION</div><h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">Impact Map</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">Explore verified actions and community initiatives with location data.</p></div>{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}<ImpactMap activities={activities} /><div className="mt-6 grid gap-4 sm:grid-cols-3"><Stat icon={MapPin} value={loading ? "…" : locations} label="Reported Locations" /><Stat icon={Activity} value={loading ? "…" : activities.length} label="Verified Actions" /><Stat icon={Map} value={loading ? "…" : sdgs} label="SDGs Represented" /></div></div></section>;
}

function Stat({ icon: Icon, value, label }: { icon: typeof MapPin; value: number | string; label: string }) { return <div className="sustain-card flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f5ea] text-[#0f5132]"><Icon size={20} /></div><div><div className="text-2xl font-black text-[#173526]">{typeof value === "number" ? value.toLocaleString() : value}</div><p className="text-xs text-[#7d8a82]">{label}</p></div></div>; }
