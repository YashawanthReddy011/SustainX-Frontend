import SDGCard from "../../components/sdg-card";

const sdgs = [
	{ id: 1, code: "SDG 1", title: "No Poverty", shortDescription: "End poverty in all its forms everywhere." },
	{ id: 2, code: "SDG 2", title: "Zero Hunger", shortDescription: "End hunger, achieve food security and promote sustainable agriculture." },
	{ id: 3, code: "SDG 3", title: "Good Health and Well-being", shortDescription: "Ensure healthy lives and promote well-being for all." },
	{ id: 4, code: "SDG 4", title: "Quality Education", shortDescription: "Ensure inclusive and equitable quality education and lifelong learning." },
	{ id: 5, code: "SDG 5", title: "Gender Equality", shortDescription: "Achieve gender equality and empower women and girls." },
	{ id: 6, code: "SDG 6", title: "Clean Water and Sanitation", shortDescription: "Ensure availability and sustainable management of water and sanitation." },
	{ id: 7, code: "SDG 7", title: "Affordable and Clean Energy", shortDescription: "Ensure access to affordable, reliable, sustainable and modern energy." },
	{ id: 8, code: "SDG 8", title: "Decent Work and Economic Growth", shortDescription: "Promote sustained, inclusive and sustainable economic growth." },
	{ id: 9, code: "SDG 9", title: "Industry, Innovation and Infrastructure", shortDescription: "Build resilient infrastructure and foster innovation." },
	{ id: 10, code: "SDG 10", title: "Reduced Inequalities", shortDescription: "Reduce inequality within and among countries." },
	{ id: 11, code: "SDG 11", title: "Sustainable Cities and Communities", shortDescription: "Make cities and human settlements inclusive, safe and sustainable." },
	{ id: 12, code: "SDG 12", title: "Responsible Consumption and Production", shortDescription: "Ensure sustainable consumption and production patterns." },
	{ id: 13, code: "SDG 13", title: "Climate Action", shortDescription: "Take urgent action to combat climate change and its impacts." },
	{ id: 14, code: "SDG 14", title: "Life Below Water", shortDescription: "Conserve and sustainably use oceans, seas and marine resources." },
	{ id: 15, code: "SDG 15", title: "Life on Land", shortDescription: "Protect terrestrial ecosystems, forests and biodiversity." },
	{ id: 16, code: "SDG 16", title: "Peace, Justice and Strong Institutions", shortDescription: "Promote peaceful societies, justice and accountable institutions." },
	{ id: 17, code: "SDG 17", title: "Partnerships for the Goals", shortDescription: "Strengthen global partnerships for sustainable development." },
];

export default function SDGsPage() {
	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<div className="mx-auto mb-12 max-w-3xl text-center">
					<div className="section-label">UNITED NATIONS • 17 GOALS</div>

					<h1 className="mt-5 text-4xl font-black text-[#153426] md:text-6xl">
						Explore the <span className="gradient-text">17 SDGs</span>
					</h1>

					<p className="mt-5 text-base leading-7 text-[#68776f]">
						Learn what each Sustainable Development Goal means and discover
						ways to turn knowledge into action through SustainX.
					</p>
				</div>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{sdgs.map((sdg) => (
						<SDGCard key={sdg.id} sdg={sdg} />
					))}
				</div>
			</div>
		</section>
	);
}
