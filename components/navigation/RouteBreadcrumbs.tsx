"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const detailRoutes = [
	{ base: "/sdgs", label: "SDGs", item: (id: string) => `SDG ${id}` },
	{ base: "/challenges", label: "Challenges", item: () => "Challenge details" },
	{ base: "/projects", label: "Projects", item: () => "Project details" },
];

export default function RouteBreadcrumbs() {
	const pathname = usePathname();
	const parts = pathname.split("/").filter(Boolean);
	const route = parts.length === 2 ? detailRoutes.find((item) => item.base === `/${parts[0]}`) : undefined;
	if (!route) return null;

	return (
		<div className="border-b border-[#edf2ee] bg-white">
			<nav aria-label="Breadcrumb" className="page-container py-3">
				<ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
					<li><Link href="/" className="font-semibold text-[#60736a] hover:text-[#0f5132]">Home</Link></li>
					<li className="flex items-center gap-1"><ChevronRight size={14} aria-hidden="true" className="text-[#a0ada4]" /><Link href={route.base} className="font-semibold text-[#60736a] hover:text-[#0f5132]">{route.label}</Link></li>
					<li aria-current="page" className="flex items-center gap-1 font-bold text-[#173526]"><ChevronRight size={14} aria-hidden="true" className="text-[#a0ada4]" />{route.item(parts[1])}</li>
				</ol>
			</nav>
		</div>
	);
}
