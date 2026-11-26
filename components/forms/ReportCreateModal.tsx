"use client";

import type { CommunityReport } from "../../types";
import ModalShell from "./ModalShell";
import ReportCreateForm from "./ReportCreateForm";

export default function ReportCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (report: CommunityReport) => void }) {
	return <ModalShell title="Report a community issue" onClose={onClose}><ReportCreateForm onCancel={onClose} onCreated={onCreated} /></ModalShell>;
}
