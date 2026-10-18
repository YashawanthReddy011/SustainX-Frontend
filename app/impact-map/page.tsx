import { Map, MapPin, Activity } from "lucide-react";
import ImpactMap from "../../components/map";

export default function ImpactMapPage() {
	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<div className="mb-8">
					<div className="section-label">
						<Map size={14} />
						IMPACT VISUALIZATION
					</div>

					<h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">
						Impact Map
					</h1>

					<p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">
						Explore where SustainX activities and community initiatives are
						creating measurable impact.
					</p>
				</div>

				<ImpactMap />

				<div className="mt-6 grid gap-4 sm:grid-cols-3">
					{[
						{ icon: MapPin, value: "84", label: "Impact Locations" },
						{ icon: Activity, value: "1,950", label: "Verified Actions" },
						{ icon: Map, value: "17", label: "SDGs Represented" },
					].map((item) => {
						const Icon = item.icon;

						return (
							<div className="sustain-card flex items-center gap-4 p-5" key={item.label}>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f5ea] text-[#0f5132]">
									<Icon size={20} />
								</div>

								<div>
									<div className="text-2xl font-black text-[#173526]">
										{item.value}
									</div>
									<p className="text-xs text-[#7d8a82]">{item.label}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
