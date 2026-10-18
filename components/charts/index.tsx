"use client";

import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	BarChart,
	Bar,
} from "recharts";

const activityData = [
	{ month: "Jan", activities: 12 },
	{ month: "Feb", activities: 18 },
	{ month: "Mar", activities: 25 },
	{ month: "Apr", activities: 21 },
	{ month: "May", activities: 36 },
	{ month: "Jun", activities: 43 },
];

const sdgData = [
	{ name: "SDG 4", value: 32 },
	{ name: "SDG 6", value: 24 },
	{ name: "SDG 11", value: 28 },
	{ name: "SDG 12", value: 20 },
	{ name: "SDG 13", value: 39 },
	{ name: "SDG 15", value: 30 },
];

export function ActivityChart() {
	return (
		<div className="sustain-card p-5">
			<div className="mb-5">
				<h3 className="font-extrabold text-[#173526]">Activity Growth</h3>

				<p className="mt-1 text-xs text-[#77857d]">
					Verified activities over time
				</p>
			</div>

			<div className="h-[280px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={activityData}>
						<defs>
							<linearGradient
								id="activityGradient"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="0%" stopColor="#4f9b59" stopOpacity={0.35} />
								<stop offset="100%" stopColor="#4f9b59" stopOpacity={0.02} />
							</linearGradient>
						</defs>

						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#e4ebe6"
							vertical={false}
						/>

						<XAxis
							dataKey="month"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#7b8981", fontSize: 12 }}
						/>

						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#7b8981", fontSize: 12 }}
						/>

						<Tooltip />

						<Area
							type="monotone"
							dataKey="activities"
							stroke="#2e7c46"
							strokeWidth={3}
							fill="url(#activityGradient)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

export function SDGImpactChart() {
	return (
		<div className="sustain-card p-5">
			<div className="mb-5">
				<h3 className="font-extrabold text-[#173526]">SDG Impact</h3>

				<p className="mt-1 text-xs text-[#77857d]">
					Activities connected to major SDGs
				</p>
			</div>

			<div className="h-[280px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={sdgData}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#e4ebe6"
							vertical={false}
						/>

						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#7b8981", fontSize: 11 }}
						/>

						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#7b8981", fontSize: 12 }}
						/>

						<Tooltip />

						<Bar dataKey="value" fill="#2e7c46" radius={[6, 6, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
