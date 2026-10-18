"use client";

import { MapPin, TreePine, Users, Recycle } from "lucide-react";

const locations = [
	{
		name: "Green Campus",
		type: "Tree Plantation",
		x: "23%",
		y: "34%",
		icon: TreePine,
	},
	{
		name: "Community Center",
		type: "Awareness Drive",
		x: "62%",
		y: "28%",
		icon: Users,
	},
	{
		name: "Eco Zone",
		type: "Waste Management",
		x: "72%",
		y: "68%",
		icon: Recycle,
	},
	{
		name: "Lake Restoration",
		type: "Water Conservation",
		x: "35%",
		y: "72%",
		icon: TreePine,
	},
];

export default function ImpactMap() {
	return (
		<div className="relative h-[480px] overflow-hidden rounded-2xl border border-[#dce7df] bg-[#e9f2e9]">
			<div
				className="absolute inset-0 opacity-60"
				style={{
					backgroundImage:
						"linear-gradient(#bfd4c4 1px, transparent 1px), linear-gradient(90deg, #bfd4c4 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			<div className="absolute left-[10%] top-[12%] h-[120px] w-[230px] rounded-[45%] bg-[#c9dfc8] opacity-80" />
			<div className="absolute right-[7%] top-[38%] h-[160px] w-[250px] rounded-[50%] bg-[#c6dfc8] opacity-80" />
			<div className="absolute bottom-[5%] left-[30%] h-[130px] w-[300px] rounded-[45%] bg-[#d2e5c9] opacity-70" />

			<div className="absolute left-5 top-5 rounded-xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur">
				<p className="text-sm font-extrabold text-[#173526]">
					SustainX Impact Map
				</p>

				<p className="mt-1 text-xs text-[#708078]">
					Real-world actions connected to SDGs
				</p>
			</div>

			{locations.map((location) => {
				const Icon = location.icon;

				return (
					<div
						key={location.name}
						className="absolute -translate-x-1/2 -translate-y-1/2"
						style={{
							left: location.x,
							top: location.y,
						}}
					>
						<div className="group relative">
							<div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#0f5132] text-white shadow-lg">
								<Icon size={18} />
							</div>

							<div className="absolute bottom-full left-1/2 mb-3 hidden w-44 -translate-x-1/2 rounded-xl bg-[#082f1e] p-3 text-white shadow-xl group-hover:block">
								<p className="text-xs font-extrabold">{location.name}</p>

								<p className="mt-1 text-[11px] text-[#b7d2c0]">
									{location.type}
								</p>
							</div>
						</div>
					</div>
				);
			})}

			<div className="absolute bottom-5 left-5 rounded-xl bg-white/90 px-4 py-3 shadow-md backdrop-blur">
				<div className="flex items-center gap-2 text-xs font-bold text-[#53635a]">
					<MapPin size={14} className="text-[#0f5132]" />
					Impact locations
				</div>
			</div>
		</div>
	);
}
