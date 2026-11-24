"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export default function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
	return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#082f1e]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
		<div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
			<div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2e9e4] bg-white p-5">
				<h2 className="text-xl font-black text-[#183529]">{title}</h2>
				<button type="button" onClick={onClose} aria-label="Close" className="rounded-lg bg-[#f1f4f2] p-2 text-[#64736b]"><X size={18} /></button>
			</div>
			<div className="p-5">{children}</div>
		</div>
	</div>;
}
