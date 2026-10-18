import {
	Users,
	MapPin,
	AlertTriangle,
	Plus,
	ArrowRight,
	CheckCircle2,
} from "lucide-react";

const reports = [
	{ title: "Open drainage near community road", category: "Civic Infrastructure", location: "Local Ward", status: "IN_PROGRESS" },
	{ title: "Plastic waste accumulation", category: "Waste Management", location: "Public Park", status: "REPORTED" },
	{ title: "Broken street lighting", category: "Public Safety", location: "Residential Area", status: "RESOLVED" },
];

export default function CommunityPage() {
	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
					<div>
						<div className="section-label">
							<Users size={14} />
							CIVICCONNECT
						</div>

						<h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">
							Community Development
						</h1>

						<p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">
							Connect communities with action. Report issues, support local
							initiatives and collaborate on solutions.
						</p>
					</div>

					<button className="btn-primary">
						<Plus size={17} />
						Report an Issue
					</button>
				</div>

				<div className="grid gap-5 md:grid-cols-3">
					{[
						{ icon: MapPin, value: "128", label: "Community Reports" },
						{ icon: AlertTriangle, value: "34", label: "Issues Under Review" },
						{ icon: CheckCircle2, value: "76", label: "Resolved Issues" },
					].map((item) => {
						const Icon = item.icon;

						return (
							<div key={item.label} className="sustain-card p-6">
								<Icon className="text-[#0f5132]" size={22} />
								<div className="mt-5 text-3xl font-black text-[#173526]">
									{item.value}
								</div>
								<p className="mt-1 text-sm text-[#77857d]">{item.label}</p>
							</div>
						);
					})}
				</div>

				<div className="mt-10">
					<h2 className="mb-4 text-xl font-black text-[#173526]">
						Community Reports
					</h2>

					<div className="space-y-4">
						{reports.map((report) => (
							<div key={report.title} className="sustain-card p-5">
								<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
									<div>
										<div className="flex flex-wrap gap-2">
											<span className="badge badge-blue">{report.category}</span>
											<span className="flex items-center gap-1 text-xs text-[#89958e]">
												<MapPin size={13} />
												{report.location}
											</span>
										</div>

										<h3 className="mt-3 text-lg font-extrabold text-[#173526]">
											{report.title}
										</h3>
									</div>

									<div className="flex items-center gap-4">
										<span
											className={
												report.status === "RESOLVED"
													? "badge badge-green"
													: report.status === "IN_PROGRESS"
														? "badge badge-yellow"
														: "badge badge-blue"
											}
										>
											{report.status.replace("_", " ")}
										</span>

										<button className="flex items-center gap-1 text-sm font-bold text-[#0f5132]">
											View
											<ArrowRight size={15} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="mt-10 rounded-2xl bg-[#0f5132] p-8 text-white">
					<h2 className="text-2xl font-black">
						Your community is part of the solution.
					</h2>
					<p className="mt-3 max-w-2xl text-sm leading-7 text-[#c0d9c8]">
						Small reports and local actions can become measurable community
						impact when people collaborate.
					</p>
				</div>
			</div>
		</section>
	);
}
