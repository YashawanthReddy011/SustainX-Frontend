"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import { normalizeReturnPath } from "../../lib/return-path";

export default function VerifyEmailPage() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("Checking your verification link…");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [returnTo, setReturnTo] = useState<string | null>(null);
	const [verified, setVerified] = useState(false);
	const verificationStarted = useRef(false);

	useEffect(() => {
		if (verificationStarted.current) return;
		verificationStarted.current = true;
		const requestedPath = normalizeReturnPath(new URLSearchParams(window.location.search).get("next"));
		setReturnTo(requestedPath);
		const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
		if (!token) { setMessage(""); return; }
		api.post("/auth/verify-email", { token })
			.then(({ data }) => {
				setVerified(true);
				setMessage(data.message || "Email verified. You can sign in now.");
				window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
			})
			.catch((e) => { setMessage(""); setError(e?.response?.data?.error || "This verification link is invalid or expired."); });
	}, []);

	async function resend(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true); setError(""); setMessage("");
		try {
			const requestedPath = normalizeReturnPath(new URLSearchParams(window.location.search).get("next")) || returnTo;
			const { data } = await api.post("/auth/resend-verification", { email, ...(requestedPath ? { next: requestedPath } : {}) });
			setMessage(data.message || "If the account needs verification, a link will be sent.");
		} catch (e: any) {
			setError(e?.response?.data?.error || "Unable to resend the verification link.");
		} finally { setLoading(false); }
	}

	const loginHref = returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login";
	return <main className="min-h-[calc(100vh-72px)] bg-[#f5f8f6] px-4 py-12"><section className="sustain-card mx-auto max-w-lg p-7 md:p-9"><p className="text-xs font-black uppercase tracking-widest text-[#478253]">EMAIL VERIFICATION</p><h1 className="mt-3 text-2xl font-black text-[#173526]">Verify your email</h1>{message && <p role="status" className="mt-5 rounded-xl bg-[#eaf7ed] p-4 text-sm text-[#245c35]">{message}</p>}{error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0f1] p-4 text-sm text-[#a52b36]">{error}</p>}{process.env.NODE_ENV === "development" && <p className="mt-4 rounded-xl bg-[#f1f5f2] p-3 text-xs leading-5 text-[#64736b]">If email delivery is not configured locally, the verification URL is printed in the backend terminal.</p>}{verified ? <Link href={loginHref} className="btn-primary mt-6 w-full justify-center">Continue to sign in</Link> : <form onSubmit={resend} className="mt-6 space-y-4"><p className="text-sm leading-6 text-[#748179]">Need a fresh link? Enter the email used to register.</p><label className="block text-sm font-bold text-[#405349]">Email address<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm" /></label><button disabled={loading} className="btn-primary w-full justify-center">{loading ? "Sending…" : "Resend verification link"}</button></form>}<p className="mt-6 text-center text-sm text-[#748179]"><Link href={loginHref} className="font-bold text-[#0f5132]">Back to sign in</Link></p></section></main>;
}
