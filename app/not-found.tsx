import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

const destinations = [
	{ label: "SDGs", href: "/sdgs" },
	{ label: "Challenges", href: "/challenges" },
	{ label: "Projects", href: "/projects" },
	{ label: "Community", href: "/community" },
	{ label: "EcoGuard", href: "/ecoguard" },
];

export default function NotFound() {
	return (
		<section className="section min-h-[55vh] bg-[#f7faf7]">
			<div className="page-container max-w-2xl">
				<div className="sustain-card p-8 text-center">
					<p className="text-sm font-black tracking-[0.2em] text-[#4b8a58]">404</p>
					<h1 className="mt-3 text-3xl font-black text-[#173526]">We couldn’t find that page.</h1>
					<p className="mt-3 text-sm leading-6 text-[#68776f]">Choose a SustainX destination to keep exploring.</p>
					<Link href="/" className="btn-primary mt-6"><Home size={16} />Go Home</Link>
					<nav aria-label="SustainX pages" className="mt-7 flex flex-wrap justify-center gap-2">
						{destinations.map((item) => <Link key={item.href} href={item.href} className="inline-flex items-center gap-1 rounded-full border border-[#d9e5dc] px-3 py-2 text-sm font-bold text-[#0f5132] hover:bg-[#edf7f0]">{item.label}<ArrowRight size={13} /></Link>)}
					</nav>
				</div>
			</div>
		</section>
	);
}
