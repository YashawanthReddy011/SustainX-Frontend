import Link from "next/link";
import {
	ArrowLeft,
	BookOpen,
	Lightbulb,
	Target,
	CheckCircle2,
	ArrowRight,
} from "lucide-react";

const sdgData: Record<
	number,
	{
		title: string;
		description: string;
		actions: string[];
		targets: string[];
	}
> = {
	1: {
		title: "No Poverty",
		description:
			"End poverty in all its forms everywhere and support opportunities that improve economic resilience.",
		actions: [
			"Support local community initiatives",
			"Create skill development opportunities",
			"Promote financial awareness",
		],
		targets: ["Reduce poverty", "Build social protection", "Improve access to resources"],
	},
	4: {
		title: "Quality Education",
		description:
			"Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
		actions: [
			"Create peer-learning programs",
			"Develop educational resources",
			"Support digital literacy",
			"Mentor younger students",
		],
		targets: ["Quality learning", "Equal educational opportunity", "Lifelong learning"],
	},
	6: {
		title: "Clean Water and Sanitation",
		description:
			"Ensure availability and sustainable management of water and sanitation for all.",
		actions: [
			"Organize water awareness campaigns",
			"Report water leakage",
			"Promote rainwater harvesting",
			"Reduce water wastage",
		],
		targets: ["Safe water access", "Water efficiency", "Sustainable water management"],
	},
	11: {
		title: "Sustainable Cities and Communities",
		description:
			"Make cities and human settlements inclusive, safe, resilient and sustainable.",
		actions: [
			"Report local civic issues",
			"Support clean public spaces",
			"Promote sustainable mobility",
			"Participate in community planning",
		],
		targets: ["Inclusive communities", "Safe public spaces", "Sustainable urban development"],
	},
	12: {
		title: "Responsible Consumption and Production",
		description:
			"Ensure sustainable consumption and production patterns and reduce waste.",
		actions: [
			"Run waste segregation campaigns",
			"Reduce single-use products",
			"Promote reuse and repair",
			"Track campus waste",
		],
		targets: ["Waste reduction", "Resource efficiency", "Responsible consumption"],
	},
	13: {
		title: "Climate Action",
		description: "Take urgent action to combat climate change and its impacts.",
		actions: [
			"Organize climate awareness programs",
			"Measure carbon-conscious actions",
			"Promote public transport",
			"Plant and protect trees",
		],
		targets: ["Climate awareness", "Climate resilience", "Low-carbon actions"],
	},
	15: {
		title: "Life on Land",
		description:
			"Protect, restore and promote sustainable use of terrestrial ecosystems and biodiversity.",
		actions: [
			"Plant native trees",
			"Create biodiversity records",
			"Protect local habitats",
			"Organize biodiversity awareness drives",
		],
		targets: ["Forest protection", "Biodiversity conservation", "Land restoration"],
	},
	17: {
		title: "Partnerships for the Goals",
		description:
			"Strengthen partnerships and collaboration for sustainable development.",
		actions: [
			"Connect student organizations",
			"Collaborate with local communities",
			"Create cross-campus projects",
			"Share knowledge and resources",
		],
		targets: ["Multi-stakeholder partnerships", "Knowledge sharing", "Collaborative action"],
	},
};

export default async function SDGDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const numericId = Number(id);
	const data = sdgData[numericId] || sdgData[4];

	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<Link
					href="/sdgs"
					className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"
				>
					<ArrowLeft size={16} />
					Back to SDGs
				</Link>

				<div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
					<div className="sustain-card p-7 md:p-10">
						<div className="flex items-center gap-3">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f5132] text-xl font-black text-white">
								{numericId}
							</div>

							<div>
								<p className="text-xs font-bold uppercase tracking-widest text-[#7c8b82]">
									Sustainable Development Goal
								</p>

								<h1 className="mt-1 text-3xl font-black text-[#163526] md:text-4xl">
									{data.title}
								</h1>
							</div>
						</div>

						<p className="mt-8 text-base leading-8 text-[#65746c]">
							{data.description}
						</p>

						<div className="mt-10">
							<div className="mb-5 flex items-center gap-2">
								<Lightbulb size={19} className="text-[#0f5132]" />
								<h2 className="font-extrabold text-[#183829]">How you can act</h2>
							</div>

							<div className="grid gap-3">
								{data.actions.map((action) => (
									<div
										key={action}
										className="flex items-center gap-3 rounded-xl bg-[#f1f8f3] p-4"
									>
										<CheckCircle2 size={17} className="shrink-0 text-[#3e8b4e]" />
										<span className="text-sm font-semibold text-[#43554b]">
											{action}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="space-y-5">
						<div className="sustain-card p-7">
							<div className="flex items-center gap-3">
								<Target className="text-[#0f5132]" size={22} />
								<h2 className="font-extrabold text-[#183829]">Key focus areas</h2>
							</div>

							<div className="mt-5 space-y-3">
								{data.targets.map((target) => (
									<div
										key={target}
										className="rounded-xl border border-[#e1ebe4] p-4 text-sm font-semibold text-[#5e6e65]"
									>
										{target}
									</div>
								))}
							</div>
						</div>

						<div className="rounded-2xl bg-[#0f5132] p-7 text-white">
							<BookOpen size={25} />
							<h2 className="mt-5 text-xl font-black">Ready to create impact?</h2>
							<p className="mt-2 text-sm leading-6 text-[#c1d9c8]">
								Turn this SDG into an activity and start building your impact
								record.
							</p>
							<Link
								href="/challenges"
								className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0f5132]"
							>
								Find Challenges
								<ArrowRight size={16} />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
