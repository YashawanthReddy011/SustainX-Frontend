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

export function ActivityChart({ data }: { data: Array<{ month: string; activities: number }> }) {
	return (
		<div className="sustain-card p-5">
			<div className="mb-5">
				<h3 className="font-extrabold text-[#173526]">Activity Growth</h3>

				<p className="mt-1 text-xs text-[#77857d]">
					Verified activities over time
				</p>
			</div>

			{data.length === 0 ? <div className="flex h-[280px] items-center justify-center text-sm text-[#89958e]">Verified activity history will appear here.</div> : <div className="h-[280px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data}>
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
			</div>}
		</div>
	);
}

export function SDGImpactChart({ data }: { data: Array<{ name: string; value: number }> }) {
	return (
		<div className="sustain-card p-5">
			<div className="mb-5">
				<h3 className="font-extrabold text-[#173526]">SDG Impact</h3>

				<p className="mt-1 text-xs text-[#77857d]">
					Activities connected to major SDGs
				</p>
			</div>

			{data.length === 0 ? <div className="flex h-[280px] items-center justify-center text-sm text-[#89958e]">Verified SDG impact will appear here.</div> : <div className="h-[280px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data}>
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
			</div>}
		</div>
	);
}
