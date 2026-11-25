export default function Loading() {
	return (
		<section className="section min-h-[55vh] bg-[#f7faf7]" aria-busy="true" aria-live="polite">
			<div className="page-container">
				<p className="mb-5 text-sm font-semibold text-[#60736a]">Loading SustainX…</p>
				<div className="grid gap-4 md:grid-cols-3">
					{[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-[#e5eee7]" />)}
				</div>
			</div>
		</section>
	);
}
