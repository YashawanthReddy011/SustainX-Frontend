import {
	Leaf,
	TreePine,
	Recycle,
	Droplets,
	Bird,
	Plus,
	ArrowRight,
} from "lucide-react";

const environmentalActions = [
	{ title: "Tree Plantation", description: "Plant and maintain native trees and document their growth.", icon: TreePine, value: "1,248", label: "Trees recorded" },
	{ title: "Water Conservation", description: "Record water-saving actions and support responsible water use.", icon: Droplets, value: "84", label: "Actions" },
	{ title: "Waste Reduction", description: "Track segregation, reuse and waste reduction activities.", icon: Recycle, value: "426 kg", label: "Waste diverted" },
	{ title: "Biodiversity", description: "Document local species and create biodiversity observations.", icon: Bird, value: "192", label: "Records" },
];

export default function EarthPage() {
	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<div className="mb-12 overflow-hidden rounded-[28px] bg-[#0b4129] p-8 text-white md:p-12">
					<div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
						<div>
							<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a7cdb2]">
								<Leaf size={15} />
								ECOGUARD
							</div>

							<h1 className="mt-5 max-w-3xl text-4xl font-black md:text-6xl">
								Protect the systems that protect us.
							</h1>

							<p className="mt-5 max-w-2xl text-sm leading-7 text-[#bed7c7]">
								Build environmental awareness through tree plantation,
								biodiversity records, water conservation and responsible
								consumption.
							</p>

							<button className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">
								<Plus size={16} />
								Add Environmental Activity
							</button>
						</div>

						<div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10">
							<Leaf size={65} className="text-[#8dca91]" />
						</div>
					</div>
				</div>

				<div className="grid gap-5 sm:grid-cols-2">
					{environmentalActions.map((action) => {
						const Icon = action.icon;

						return (
							<div
								key={action.title}
								className="sustain-card sustain-card-hover p-6"
							>
								<div className="flex items-start justify-between">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f4e9] text-[#0f5132]">
										<Icon size={23} />
									</div>

									<div className="text-right">
										<div className="text-xl font-black text-[#173526]">
											{action.value}
										</div>
										<div className="text-[11px] font-semibold text-[#89968f]">
											{action.label}
										</div>
									</div>
								</div>

								<h2 className="mt-6 text-xl font-black text-[#173526]">
									{action.title}
								</h2>

								<p className="mt-2 text-sm leading-6 text-[#68776f]">
									{action.description}
								</p>

								<button className="mt-5 flex items-center gap-2 text-sm font-bold text-[#0f5132]">
									Explore
									<ArrowRight size={15} />
								</button>
							</div>
						);
					})}
				</div>

				<div className="mt-10 grid gap-5 lg:grid-cols-3">
					{[
						{ value: "7", title: "Environmental SDGs", description: "Connect your environmental activities to measurable SDG impact." },
						{ value: "1,950", title: "Verified Actions", description: "Actions submitted and verified through the SustainX workflow." },
						{ value: "42", title: "Active Projects", description: "Environmental initiatives currently being developed." },
					].map((metric) => (
						<div key={metric.title} className="sustain-card p-6">
							<div className="text-3xl font-black text-[#0f5132]">{metric.value}</div>
							<p className="mt-2 text-sm font-bold text-[#5e6d65]">{metric.title}</p>
							<p className="mt-2 text-xs leading-5 text-[#87938d]">{metric.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
