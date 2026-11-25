"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Target } from "lucide-react";
import SDGCard from "../../components/sdg-card";
import { getSDGs } from "../../services/sdg.service";
import type { SDG } from "../../types";

export default function SDGsPage() {
	const [sdgs, setSdgs] = useState<SDG[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("All");
	useEffect(() => { getSDGs().then(setSdgs).catch(() => setError("Unable to load SDGs. Check that the backend is running and its database is seeded." )).finally(() => setLoading(false)); }, []);
	const categories = ["All", "People", "Prosperity", "Planet", "Partnership"];
	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		return sdgs.filter((sdg) => {
			const matchesSearch = !query || `${sdg.id} ${sdg.title} ${sdg.shortDescription}`.toLowerCase().includes(query);
			const matchesCategory = category === "All" || sdg.category === category;
			return matchesSearch && matchesCategory && sdg.isActive !== false;
		});
	}, [sdgs, search, category]);
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="mb-10 text-center"><div className="section-label mx-auto"><Target size={14} />GLOBAL GOALS</div><h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">Sustainable Development Goals</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#68776f]">Explore the 17 global goals and find practical ways to create measurable change.</p></div>
		<div className="mb-7 flex flex-col gap-3 rounded-2xl border border-[#dce7df] bg-white p-4 md:flex-row">
			<div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#849087]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by number or SDG name..." className="h-11 w-full rounded-xl border border-[#d8e4dc] pl-10 pr-4 text-sm outline-none focus:border-[#74a980]" /></div>
			<select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter SDGs by category" className="h-11 rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm font-semibold text-[#405349]">{categories.map((item) => <option key={item}>{item}</option>)}</select>
		</div>
		{error && <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36] sm:flex-row sm:items-center sm:justify-between"><p>{error}</p><button onClick={() => window.location.reload()} className="font-bold underline">Try again</button></div>}{loading ? <p className="py-10 text-center text-sm text-[#68776f]">Loading goals…</p> : error ? null : filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((sdg) => <SDGCard key={sdg.id} sdg={sdg} />)}</div> : <div className="sustain-card p-8 text-center text-sm text-[#68776f]">No SDGs match your search or category.</div>}</div></section>;
}
