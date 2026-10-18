"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Trophy,
	CalendarDays,
	Users,
	ArrowRight,
	Search,
} from "lucide-react";

const challenges = [
	{ id: 1, title: "30-Day Green Campus", description: "Make your campus greener through daily sustainable actions.", sdg: 13, points: 500, participants: 128, deadline: "30 Days" },
	{ id: 2, title: "Water Saver Challenge", description: "Identify and reduce unnecessary water consumption around you.", sdg: 6, points: 350, participants: 74, deadline: "21 Days" },
	{ id: 3, title: "Plastic-Free Week", description: "Reduce single-use plastic and document your sustainable alternatives.", sdg: 12, points: 300, participants: 95, deadline: "7 Days" },
	{ id: 4, title: "Campus Biodiversity Hunt", description: "Observe and document plants, birds and biodiversity in your area.", sdg: 15, points: 450, participants: 61, deadline: "14 Days" },
];

export default function ChallengesPage() {
	const [search, setSearch] = useState("");
	const filtered = challenges.filter((challenge) =>
		challenge.title.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
					<div>
						<div className="section-label">
							<Trophy size={14} />
							TAKE ACTION
						</div>

						<h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">
							Challenges
						</h1>

						<p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">
							Join practical SDG challenges, submit evidence and earn impact
							points.
						</p>
					</div>

					<div className="relative w-full md:w-[300px]">
						<Search
							size={17}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829088]"
						/>

						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search challenges..."
							className="h-11 w-full rounded-xl border border-[#d9e5dc] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#78ad84]"
						/>
					</div>
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					{filtered.map((challenge) => (
						<div
							key={challenge.id}
							className="sustain-card sustain-card-hover p-6"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f4e9] text-[#0f5132]">
									<Trophy size={23} />
								</div>

								<span className="badge badge-green">SDG {challenge.sdg}</span>
							</div>

							<h2 className="mt-6 text-xl font-black text-[#173526]">
								{challenge.title}
							</h2>

							<p className="mt-2 text-sm leading-6 text-[#68776f]">
								{challenge.description}
							</p>

							<div className="mt-6 grid grid-cols-3 gap-3">
								<div className="rounded-xl bg-[#f5f8f5] p-3">
									<Trophy size={15} className="text-[#0f5132]" />
									<p className="mt-2 text-xs text-[#849087]">Reward</p>
									<p className="text-sm font-black text-[#173526]">
										{challenge.points}
									</p>
								</div>

								<div className="rounded-xl bg-[#f5f8f5] p-3">
									<Users size={15} className="text-[#0f5132]" />
									<p className="mt-2 text-xs text-[#849087]">Joined</p>
									<p className="text-sm font-black text-[#173526]">
										{challenge.participants}
									</p>
								</div>

								<div className="rounded-xl bg-[#f5f8f5] p-3">
									<CalendarDays size={15} className="text-[#0f5132]" />
									<p className="mt-2 text-xs text-[#849087]">Duration</p>
									<p className="text-sm font-black text-[#173526]">
										{challenge.deadline}
									</p>
								</div>
							</div>

							<Link href="/login" className="btn-primary mt-6 w-full">
								Join Challenge
								<ArrowRight size={16} />
							</Link>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
