import Link from "next/link";
import { Leaf, ArrowUpRight } from "lucide-react";

export default function Footer() {
	return (
		<footer className="bg-[#082f1e] text-white">
			<div className="page-container py-14">
				<div className="grid gap-10 md:grid-cols-4">
					<div className="md:col-span-2">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
								<Leaf size={22} />
							</div>

							<div>
								<div className="text-xl font-extrabold">SustainX</div>
								<div className="text-xs text-[#a8c5b2]">
									Students • Society • Earth
								</div>
							</div>
						</div>

						<p className="max-w-xl text-sm leading-7 text-[#b6cfc0]">
							A digital platform that helps students and communities learn
							about the Sustainable Development Goals, participate in
							challenges, create projects and turn real-world action into
							measurable impact.
						</p>
					</div>

					<div>
						<h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
							Platform
						</h3>

						<div className="flex flex-col gap-3 text-sm text-[#b6cfc0]">
							<Link href="/sdgs" className="hover:text-white">
								SDG Learning
							</Link>
							<Link href="/challenges" className="hover:text-white">
								Challenges
							</Link>
							<Link href="/projects" className="hover:text-white">
								Projects
							</Link>
							<Link href="/impact-map" className="hover:text-white">
								Impact Map
							</Link>
						</div>
					</div>

					<div>
						<h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
							Modules
						</h3>

						<div className="flex flex-col gap-3 text-sm text-[#b6cfc0]">
							<Link href="/student" className="hover:text-white">
								EduImpact
							</Link>
							<Link href="/community" className="hover:text-white">
								CivicConnect
							</Link>
							<Link href="/earth" className="hover:text-white">
								EcoGuard
							</Link>
							<Link href="/certificates" className="hover:text-white">
								Certificates
							</Link>
						</div>
					</div>
				</div>

				<div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#91b2a0] md:flex-row">
					<p>© {new Date().getFullYear()} SustainX. All rights reserved.</p>

					<Link
						href="/sdgs"
						className="flex items-center gap-1 hover:text-white"
					>
						Explore the SDGs <ArrowUpRight size={14} />
					</Link>
				</div>
			</div>
		</footer>
	);
}
