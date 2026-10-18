import Link from "next/link";
import {
	ArrowRight,
	Users,
	Target,
	CheckCircle2,
} from "lucide-react";

import type { Project } from "../../types";

export default function ProjectCard({
	project,
}: {
	project: Project;
}) {
	return (
		<div className="sustain-card sustain-card-hover overflow-hidden">
			<div className="relative h-48 overflow-hidden bg-[#dcefe2]">
				{project.imageUrl ? (
					<img
						src={project.imageUrl}
						alt={project.title}
						className="h-full w-full object-cover transition duration-500 hover:scale-105"
					/>
				) : (
					<div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0f5132] to-[#5b9f55] text-white">
						<Target size={48} strokeWidth={1.4} />
					</div>
				)}

				<div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f5132] backdrop-blur">
					SDG {project.sdgId}
				</div>
			</div>

			<div className="p-5">
				<h3 className="text-lg font-extrabold text-[#173526]">
					{project.title}
				</h3>

				<p className="mt-2 line-clamp-3 text-sm leading-6 text-[#69776f]">
					{project.description}
				</p>

				<div className="mt-5 flex items-center justify-between border-t border-[#e8eee9] pt-4">
					<div className="flex items-center gap-3 text-xs font-semibold text-[#78867e]">
						{project.members !== undefined && (
							<span className="flex items-center gap-1">
								<Users size={14} />
								{project.members} members
							</span>
						)}

						{project.progress !== undefined && (
							<span className="flex items-center gap-1">
								<CheckCircle2 size={14} />
								{project.progress}%
							</span>
						)}
					</div>

					<Link
						href="/projects"
						className="flex items-center gap-1 text-sm font-bold text-[#0f5132]"
					>
						View
						<ArrowRight size={15} />
					</Link>
				</div>

				{project.progress !== undefined && (
					<div className="mt-4">
						<div className="mb-1 flex justify-between text-xs font-bold text-[#7a8980]">
							<span>Progress</span>
							<span>{project.progress}%</span>
						</div>

						<div className="h-2 overflow-hidden rounded-full bg-[#e7eee9]">
							<div
								className="h-full rounded-full bg-[#4e9a52]"
								style={{ width: `${project.progress}%` }}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
