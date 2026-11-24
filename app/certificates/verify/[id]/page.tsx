"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { getApiError, getCertificateVerification } from "../../../../services/platform.service";

type Verification = { certificateNumber: string; title: string; issuedAt: string; recipient: string; verified: boolean };
export default function VerifyCertificatePage() {
	const params = useParams<{ id: string }>(); const [certificate, setCertificate] = useState<Verification | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
	useEffect(() => { const id = decodeURIComponent(params.id); getCertificateVerification(id).then(setCertificate).catch((e) => setError(getApiError(e, "This certificate could not be verified."))).finally(() => setLoading(false)); }, [params.id]);
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="sustain-card mx-auto max-w-2xl p-8 text-center">{loading ? <p className="text-sm text-[#68776f]">Checking certificate…</p> : certificate ? <><CheckCircle2 size={42} className="mx-auto text-[#328048]" /><p className="mt-4 text-xs font-black uppercase tracking-widest text-[#328048]">Authentic certificate</p><h1 className="mt-3 text-3xl font-black text-[#173526]">{certificate.title}</h1><p className="mt-4 text-sm text-[#68776f]">Issued to {certificate.recipient} on {new Date(certificate.issuedAt).toLocaleDateString()}.</p><p className="mt-3 text-xs font-bold text-[#6b7a71]">{certificate.certificateNumber}</p></> : <><XCircle size={42} className="mx-auto text-[#b12d3b]" /><h1 className="mt-4 text-2xl font-black text-[#173526]">Certificate not verified</h1><p className="mt-2 text-sm text-[#68776f]">{error}</p></>}<Link href="/certificates" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ShieldCheck size={16} />Back to certificates</Link></div></div></section>;
}
