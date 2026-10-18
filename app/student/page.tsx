import Link from "next/link";
import {
	BookOpen,
	Trophy,
	Activity,
	Award,
	ArrowRight,
	Target,
	Clock3,
} from "lucide-react";

import ActivityCard from "../../components/activity-card";

const activities = [
	{
		id: "1",
		title: "Campus Tree Plantation",
		description: "Planted and documented native trees near the college campus.",
		sdgId: 15,
		status: "VERIFIED" as const,
		points: 100,
		createdAt: "2026-09-18",
	},
	{
		id: "2",
		title: "Water Awareness Drive",
		description: "Conducted a student awareness session on water conservation.",
		sdgId: 6,
		status: "PENDING" as const,
		points: 50,
		createdAt: "2026-09-20",
	},
];

export default function StudentPage() {
	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<div className="mb-10">
					<div className="section-label">
						<BookOpen size={14} />
						EDUIMPACT
					</div>

					<h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">
						Student Development
					</h1>

					<p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">
						Learn, participate, submit activities and build a verified impact
						portfolio.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[
						{ icon: Trophy, value: "1,240", label: "Impact Points" },
						{ icon: Activity, value: "18", label: "Activities" },
						{ icon: Target, value: "6", label: "SDGs Impacted" },
						{ icon: Award, value: "4", label: "Badges Earned" },
					].map((item) => {
						const Icon = item.icon;

						return (
							<div key={item.label} className="sustain-card p-5">
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f5ea] text-[#0f5132]">
									<Icon size={20} />
								</div>

								<div className="mt-5 text-2xl font-black text-[#173526]">
									{item.value}
								</div>

								<div className="mt-1 text-xs font-bold text-[#7d8b83]">
									{item.label}
								</div>
							</div>
						);
					})}
				</div>

				<div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
					<div>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-xl font-black text-[#173526]">My Activities</h2>

							<Link
								href="/dashboard"
								className="flex items-center gap-1 text-sm font-bold text-[#0f5132]"
							>
								View all
								<ArrowRight size={15} />
							</Link>
						</div>

						<div className="space-y-4">
							{activities.map((activity) => (
								<ActivityCard key={activity.id} activity={activity} />
							))}
						</div>
					</div>

					<div className="space-y-5">
						<div className="sustain-card p-6">
							<div className="flex items-center gap-3">
								<Clock3 size={20} className="text-[#0f5132]" />
								<h2 className="font-extrabold text-[#173526]">
									Continue Learning
								</h2>
							</div>

							<div className="mt-5 rounded-2xl bg-[#eef8f1] p-5">
								<span className="badge badge-green">SDG 13</span>
								<h3 className="mt-4 text-lg font-black text-[#173526]">
									Climate Action
								</h3>
								<p className="mt-2 text-sm leading-6 text-[#6c7972]">
									Learn the basics of climate action and discover practical
									activities.
								</p>

								<Link
									href="/sdgs/13"
									className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"
								>
									Continue
									<ArrowRight size={15} />
								</Link>
							</div>
						</div>

						<div className="rounded-2xl bg-[#0f5132] p-6 text-white">
							<Trophy size={24} />
							<h2 className="mt-4 text-xl font-black">Next milestone</h2>
							<p className="mt-2 text-sm leading-6 text-[#bfd8c6]">
								Earn 260 more points to unlock your next achievement level.
							</p>

							<div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
								<div className="h-full w-[78%] rounded-full bg-[#81c789]" />
							</div>

							<p className="mt-2 text-xs text-[#bdd5c5]">
								1,240 / 1,500 points
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
