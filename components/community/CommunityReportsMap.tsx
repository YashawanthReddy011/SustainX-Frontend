"use client";

import { useEffect, useRef } from "react";
import type { CommunityReport } from "../../types";

export default function CommunityReportsMap({ reports, onSelect }: { reports: CommunityReport[]; onSelect: (id: string) => void }) {
	const container = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let cancelled = false;
		let map: import("leaflet").Map | null = null;
		void import("leaflet").then((L) => {
			if (cancelled || !container.current) return;
			const nextMap = L.map(container.current, { scrollWheelZoom: false, zoomControl: true }).setView([20.5937, 78.9629], 4);
			map = nextMap;
			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(nextMap);
			const bounds: import("leaflet").LatLngTuple[] = [];
			for (const report of reports) {
				if (typeof report.latitude !== "number" || typeof report.longitude !== "number") continue;
				const color = report.status === "RESOLVED" ? "#39804c" : report.status === "REJECTED" ? "#9b3940" : "#0f5132";
				const icon = L.divIcon({ className: "community-report-marker", html: `<span style="--marker-color:${color}"></span>`, iconSize: [30, 38], iconAnchor: [15, 36] });
				const marker = L.marker([report.latitude, report.longitude], { icon }).addTo(nextMap);
				const popup = document.createElement("div");
				const title = document.createElement("strong"); title.textContent = report.title; title.className = "block text-sm text-[#173526]";
				const place = document.createElement("span"); place.textContent = report.location ?? "Location not provided"; place.className = "mt-1 block text-xs text-[#68776f]";
				const open = document.createElement("button"); open.type = "button"; open.textContent = "View report"; open.className = "mt-2 text-xs font-bold text-[#0f5132]"; open.addEventListener("click", () => onSelect(report.id));
				popup.append(title, place, open); marker.bindPopup(popup); bounds.push([report.latitude, report.longitude]);
			}
			if (bounds.length > 0) nextMap.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
			window.setTimeout(() => nextMap.invalidateSize(), 0);
		}).catch(() => undefined);
		return () => { cancelled = true; map?.remove(); };
	}, [reports, onSelect]);

	const locatedCount = reports.filter((report) => typeof report.latitude === "number" && typeof report.longitude === "number").length;
	return <div className="relative overflow-hidden rounded-xl border border-[#dce7df] bg-[#e9f2e9]"><div ref={container} aria-label="Interactive map of community reports" role="application" className="h-[340px] w-full sm:h-[420px]" />{locatedCount === 0 && <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/55 p-6 text-center"><div className="rounded-2xl bg-white/95 p-5 shadow-lg"><p className="text-sm font-bold text-[#173526]">No report locations yet</p><p className="mt-1 text-xs text-[#708078]">Reports with coordinates will be pinned here.</p></div></div>}<span className="absolute bottom-3 left-3 z-[400] rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-[#53635a]">{locatedCount} mapped reports</span></div>;
}
