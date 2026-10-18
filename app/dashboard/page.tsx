"use client";

import {
	Activity,
	Award,
	BarChart3,
	Bell,
	CheckCircle2,
	Clock3,
	Leaf,
	LogOut,
	Target,
	Trophy,
	Upload,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import ActivityCard from "../../components/activity-card";
import { ActivityChart, SDGImpactChart } from "../../components/charts";

const activities = [
	{
		id: "1",
		title: "Campus Tree Plantation",
		description: "Planted native trees and uploaded photographic evidence.",
		sdgId: 15,
		status: "VERIFIED" as const,
		points: 100,
		createdAt: "2026-09-18",
	},
	{
		id: "2",
		title: "Water Awareness Drive",
		description: "Student awareness activity focused on water conservation.",
		sdgId: 6,
		status: "PENDING" as const,
		points: 50,
		createdAt: "2026-09-20",
	},
];

export default function DashboardPage() {
	const { user, loading, logout } = useAuth();

	if (loading) {
		return (
			<section className="section">
				<div className="page-container">Loading dashboard...</div>
			</section>
		);
	}

	return (
		<section className="min-h-screen bg-[#f5f8f6] py-8">
			<div className="page-container">
				<div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-[#0b4129] p-6 text-white md:flex-row md:items-center">
					<div>
						<p className="text-xs font-bold uppercase tracking-widest text-[#a9cdb3]">
							PERSONAL IMPACT DASHBOARD
						</p>
						<h1 className="mt-2 text-2xl font-black md:text-3xl">
							Welcome{user?.name ? `, ${user.name}` : ""}.
						</h1>
						<p className="mt-2 text-sm text-[#bdd5c5]">
							Track your actions, points and verified impact.
						</p>
					</div>

					<button
						onClick={logout}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
					>
						<LogOut size={16} />
						Logout
					</button>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[
						{ icon: Trophy, value: "1,240", label: "Impact Points" },
						{ icon: Activity, value: "18", label: "Activities" },
						{ icon: Target, value: "6", label: "SDGs Impacted" },
						{ icon: Award, value: "4", label: "Badges" },
					].map((item) => {
						const Icon = item.icon;
						return (
							<div className="sustain-card p-5" key={item.label}>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f5ea] text-[#0f5132]">
									<Icon size={20} />
								</div>
								<div className="mt-5 text-3xl font-black text-[#173526]">
									{item.value}
								</div>
								<p className="mt-1 text-xs font-bold text-[#7d8a82]">
									{item.label}
								</p>
							</div>
						);
					})}
				</div>

				<div className="mt-6 grid gap-5 lg:grid-cols-2">
					<ActivityChart />
					<SDGImpactChart />
				</div>

				<div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
					<div>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-xl font-black text-[#173526]">
								Recent Activities
							</h2>
							<button className="flex items-center gap-2 text-sm font-bold text-[#0f5132]">
								<Upload size={16} />
								Submit Activity
							</button>
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
								<Bell size={20} className="text-[#0f5132]" />
								<h2 className="font-extrabold text-[#173526]">Notifications</h2>
							</div>

							<div className="mt-5 space-y-3">
								<div className="rounded-xl bg-[#eef8f1] p-4">
									<div className="flex gap-3">
										<CheckCircle2 size={18} className="mt-0.5 text-[#3e8b4e]" />
										<div>
											<p className="text-sm font-bold text-[#284b36]">
												Activity verified
											</p>
											<p className="mt-1 text-xs leading-5 text-[#718078]">
												Your tree plantation activity earned 100 points.
											</p>
										</div>
									</div>
								</div>

								<div className="rounded-xl bg-[#fff8e5] p-4">
									<div className="flex gap-3">
										<Clock3 size={18} className="mt-0.5 text-[#a27700]" />
										<div>
											<p className="text-sm font-bold text-[#665218]">
												Activity under review
											</p>
											<p className="mt-1 text-xs leading-5 text-[#81765b]">
												Your water awareness activity is being reviewed.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="sustain-card p-6">
							<div className="flex items-center gap-3">
								<Leaf size={20} className="text-[#0f5132]" />
								<h2 className="font-extrabold text-[#173526]">Current Level</h2>
							</div>

							<div className="mt-5 flex items-end justify-between">
								<div>
									<div className="text-3xl font-black text-[#0f5132]">
										Impact Builder
									</div>
									<p className="mt-1 text-xs text-[#7c8a82]">
										260 points to next level
									</p>
								</div>
								<BarChart3 className="text-[#74ad7b]" />
							</div>

							<div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e6eee8]">
								<div className="h-full w-[78%] rounded-full bg-[#4f9957]" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
