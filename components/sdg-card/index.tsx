import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import type { SDG } from "../../types";

const sdgColors: Record<number, string> = {
	1: "#E5243B",
	2: "#DDA63A",
	3: "#4C9F38",
	4: "#C5192D",
	5: "#FF3A21",
	6: "#26BDE2",
	7: "#FCC30B",
	8: "#A21942",
	9: "#FD6925",
	10: "#DD1367",
	11: "#FD9D24",
	12: "#BF8B2E",
	13: "#3F7E44",
	14: "#0A97D9",
	15: "#56C02B",
	16: "#00689D",
	17: "#19486A",
};

export default function SDGCard({ sdg }: { sdg: SDG }) {
	const color = sdg.color || sdgColors[sdg.id] || "#0f5132";

	return (
		<Link
			href={`/sdgs/${sdg.id}`}
			className="sustain-card sustain-card-hover group overflow-hidden"
		>
			<div className="h-2" style={{ backgroundColor: color }} />

			<div className="p-5">
				<div className="mb-5 flex items-start justify-between gap-3">
					<div
						className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white"
						style={{ backgroundColor: color }}
					>
						{sdg.id}
					</div>
					{sdg.category && <span className="rounded-full bg-[#f0f6f1] px-3 py-1.5 text-xs font-bold text-[#4d6656]">{sdg.category}</span>}
				</div>

				<p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#789087]">
					SDG {sdg.id}
				</p>

				<h3 className="mb-2 text-lg font-extrabold text-[#173526]">
					{sdg.title}
				</h3>

				<p className="line-clamp-3 text-sm leading-6 text-[#65756c]">
					{sdg.shortDescription}
				</p>

				<div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e7eee9] pt-4">
					<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#718278]">
						<Target size={14} className="text-[#6d9b77]" />
						{typeof sdg.targetCount === "number" ? `${sdg.targetCount} official targets` : "Target count unavailable"}
					</span>
					<span className="inline-flex items-center gap-1 text-sm font-bold text-[#0f5132]">
						Explore<ArrowRight size={16} className="transition group-hover:translate-x-1" />
					</span>
				</div>
			</div>
		</Link>
	);
}
