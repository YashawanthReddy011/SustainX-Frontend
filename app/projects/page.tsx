import {
	FolderKanban,
	Plus,
	Users,
	Leaf,
	ArrowRight,
} from "lucide-react";

import ProjectCard from "../../components/project-card";

const projects = [
	{
		id: "1",
		title: "Campus Tree Revival",
		description:
			"A student-led project to restore green spaces through native tree plantation and maintenance.",
		sdgId: 15,
		members: 32,
		progress: 72,
	},
	{
		id: "2",
		title: "Zero Waste Campus",
		description:
			"Building better waste segregation and awareness systems across campus.",
		sdgId: 12,
		members: 24,
		progress: 58,
	},
	{
		id: "3",
		title: "Every Drop Counts",
		description:
			"Water conservation awareness and leakage reporting initiative.",
		sdgId: 6,
		members: 19,
		progress: 81,
	},
	{
		id: "4",
		title: "Climate Learning Lab",
		description:
			"Peer-led workshops that help students understand climate action.",
		sdgId: 13,
		members: 41,
		progress: 64,
	},
];

export default function ProjectsPage() {
	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
					<div>
						<div className="section-label">
							<FolderKanban size={14} />
							COLLABORATE
						</div>

						<h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">
							Impact Projects
						</h1>

						<p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">
							Discover projects created by students and communities around
							practical sustainability goals.
						</p>
					</div>

					<button className="btn-primary">
						<Plus size={17} />
						Create Project
					</button>
				</div>

				<div className="mb-8 grid gap-4 sm:grid-cols-3">
					{[
						{ icon: FolderKanban, value: "24", label: "Active Projects" },
						{ icon: Users, value: "326", label: "Participants" },
						{ icon: Leaf, value: "7", label: "SDGs Covered" },
					].map((item) => {
						const Icon = item.icon;

						return (
							<div
								key={item.label}
								className="sustain-card flex items-center gap-4 p-5"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f5ea] text-[#0f5132]">
									<Icon size={20} />
								</div>

								<div>
									<div className="text-2xl font-black text-[#173526]">
										{item.value}
									</div>
									<div className="text-xs font-semibold text-[#7a8880]">
										{item.label}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					{projects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>

				<div className="mt-8 rounded-2xl bg-[#0f5132] p-7 text-white">
					<div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
						<div>
							<h2 className="text-xl font-black">Have an idea for change?</h2>
							<p className="mt-2 text-sm text-[#bdd5c5]">
								Build a project with other students and turn your idea into
								measurable impact.
							</p>
						</div>

						<button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">
							Start a Project
							<ArrowRight size={16} />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
