"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import SDGCard from "../../components/sdg-card";
import { getSDGs } from "../../services/sdg.service";
import type { SDG } from "../../types";

export default function SDGsPage() {
	const [sdgs, setSdgs] = useState<SDG[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
	useEffect(() => { getSDGs().then(setSdgs).catch(() => setError("Unable to load SDGs. Check that the backend is running and its database is seeded." )).finally(() => setLoading(false)); }, []);
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="mb-10 text-center"><div className="section-label mx-auto"><Target size={14} />GLOBAL GOALS</div><h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">Sustainable Development Goals</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#68776f]">Explore the 17 global goals and find practical ways to create measurable change.</p></div>{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}{loading ? <p className="py-10 text-center text-sm text-[#68776f]">Loading goals…</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{sdgs.map((sdg) => <SDGCard key={sdg.id} sdg={sdg} />)}</div>}</div></section>;
}
