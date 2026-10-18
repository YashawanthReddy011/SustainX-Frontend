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
	const color = sdgColors[sdg.id] || "#0f5132";

	return (
		<Link
			href={`/sdgs/${sdg.id}`}
			className="sustain-card sustain-card-hover group overflow-hidden"
		>
			<div className="h-2" style={{ backgroundColor: color }} />

			<div className="p-5">
				<div className="mb-5 flex items-start justify-between">
					<div
						className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white"
						style={{ backgroundColor: color }}
					>
						{sdg.id}
					</div>

					<Target
						size={18}
						className="text-[#9aaa9f] transition group-hover:text-[#0f5132]"
					/>
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

				<div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#0f5132]">
					Explore SDG
					<ArrowRight
						size={16}
						className="transition group-hover:translate-x-1"
					/>
				</div>
			</div>
		</Link>
	);
}
