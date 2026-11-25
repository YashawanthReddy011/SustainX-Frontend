"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => { console.error(error); }, [error]);

	return (
		<section className="section min-h-[55vh] bg-[#f7faf7]">
			<div className="page-container max-w-2xl">
				<div role="alert" className="sustain-card p-8">
					<p className="section-label">Something went wrong</p>
					<h1 className="mt-4 text-3xl font-black text-[#173526]">This page could not load.</h1>
					<p className="mt-3 text-sm leading-6 text-[#68776f]">Try again, or return to SustainX Home.</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<button onClick={reset} className="btn-primary"><RefreshCw size={16} />Try again</button>
						<Link href="/" className="btn-secondary">Home</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
