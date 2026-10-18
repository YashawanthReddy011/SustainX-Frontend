import {
	CheckCircle2,
	Clock3,
	XCircle,
	AlertCircle,
	ArrowUpRight,
} from "lucide-react";

import type { Activity } from "../../types";

function StatusIcon({ status }: { status: Activity["status"] }) {
	if (status === "VERIFIED") {
		return <CheckCircle2 size={17} />;
	}

	if (status === "REJECTED") {
		return <XCircle size={17} />;
	}

	if (status === "NEEDS_INFO") {
		return <AlertCircle size={17} />;
	}

	return <Clock3 size={17} />;
}

export default function ActivityCard({
	activity,
}: {
	activity: Activity;
}) {
	const statusClass = {
		VERIFIED: "badge badge-green",
		PENDING: "badge badge-yellow",
		REJECTED: "badge badge-red",
		NEEDS_INFO: "badge badge-blue",
	}[activity.status];

	return (
		<div className="sustain-card p-5">
			<div className="flex flex-col justify-between gap-4 sm:flex-row">
				<div>
					<div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#829088]">
						SDG {activity.sdgId}
					</div>

					<h3 className="text-lg font-extrabold text-[#183829]">
						{activity.title}
					</h3>

					<p className="mt-2 max-w-2xl text-sm leading-6 text-[#68766e]">
						{activity.description}
					</p>
				</div>

				<div className={statusClass}>
					<StatusIcon status={activity.status} />

					{activity.status}
				</div>
			</div>

			<div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#e8eee9] pt-4">
				{activity.points !== undefined && (
					<span className="rounded-lg bg-[#eef8f0] px-3 py-2 text-xs font-bold text-[#176d3d]">
						+{activity.points} points
					</span>
				)}

				{activity.evidenceUrl && (
					<a
						href={activity.evidenceUrl}
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-1 text-xs font-bold text-[#0f5132]"
					>
						View evidence
						<ArrowUpRight size={14} />
					</a>
				)}

				{activity.createdAt && (
					<span className="text-xs text-[#87958d]">
						{new Date(activity.createdAt).toLocaleDateString()}
					</span>
				)}
			</div>
		</div>
	);
}
