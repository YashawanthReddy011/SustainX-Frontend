import {
	Award,
	ShieldCheck,
	QrCode,
	Download,
	ExternalLink,
} from "lucide-react";

const certificates = [
	{
		id: "SX-2026-000124",
		title: "Climate Action Contributor",
		date: "18 Sep 2026",
		status: "ACTIVE",
	},
	{
		id: "SX-2026-000098",
		title: "Community Impact Volunteer",
		date: "02 Aug 2026",
		status: "ACTIVE",
	},
];

export default function CertificatesPage() {
	return (
		<section className="section bg-[#f7faf7]">
			<div className="page-container">
				<div className="mb-10">
					<div className="section-label">
						<Award size={14} />
						VERIFIED ACHIEVEMENT
					</div>

					<h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">
						My Certificates
					</h1>

					<p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">
						Certificates issued for verified participation and measurable
						SustainX impact.
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{certificates.map((certificate) => (
						<div key={certificate.id} className="sustain-card overflow-hidden">
							<div className="bg-[#0b4129] p-7 text-white">
								<div className="flex items-start justify-between">
									<div>
										<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#b9d5c1]">
											<ShieldCheck size={15} />
											Verified Certificate
										</div>

										<h2 className="mt-5 text-2xl font-black">
											{certificate.title}
										</h2>
									</div>

									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
										<Award size={24} />
									</div>
								</div>
							</div>

							<div className="p-6">
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<p className="text-xs font-bold uppercase tracking-wider text-[#89958d]">
											Certificate ID
										</p>
										<p className="mt-1 text-sm font-black text-[#173526]">
											{certificate.id}
										</p>
									</div>

									<div>
										<p className="text-xs font-bold uppercase tracking-wider text-[#89958d]">
											Issued
										</p>
										<p className="mt-1 text-sm font-black text-[#173526]">
											{certificate.date}
										</p>
									</div>
								</div>

								<div className="mt-5 flex items-center justify-between rounded-xl bg-[#eff8f1] p-4">
									<div className="flex items-center gap-2 text-sm font-bold text-[#24623a]">
										<ShieldCheck size={17} />
										{certificate.status}
									</div>
									<QrCode size={30} className="text-[#0f5132]" />
								</div>

								<div className="mt-5 flex gap-3">
									<button className="btn-primary flex-1">
										<Download size={16} />
										Download
									</button>

									<button className="btn-secondary">
										<ExternalLink size={16} />
										Verify
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
