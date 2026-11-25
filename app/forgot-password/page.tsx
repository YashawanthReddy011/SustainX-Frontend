"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError("");
		try {
			const { data } = await api.post("/auth/forgot-password", { email });
			setMessage(data.message || "If an account exists, reset instructions will be sent.");
		} catch (e: any) {
			setError(e?.response?.data?.error || "Unable to request a password reset.");
		} finally {
			setLoading(false);
		}
	}

	return <main className="min-h-[calc(100vh-72px)] bg-[#f5f8f6] px-4 py-12"><section className="sustain-card mx-auto max-w-lg p-7 md:p-9"><p className="text-xs font-black uppercase tracking-widest text-[#478253]">ACCOUNT RECOVERY</p><h1 className="mt-3 text-2xl font-black text-[#173526]">Reset your password</h1><p className="mt-2 text-sm leading-6 text-[#748179]">Enter your account email and we’ll send a one-time reset link if the account is eligible.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-bold text-[#405349]">Email address<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm" /></label>{message && <p role="status" className="rounded-xl bg-[#eaf7ed] p-3 text-sm text-[#245c35]">{message}<span className="mt-1 block text-xs">In local development, check the backend terminal for the reset link.</span></p>}{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}<button disabled={loading} className="btn-primary w-full justify-center">{loading ? "Sending…" : "Send reset link"}</button></form><p className="mt-6 text-center text-sm text-[#748179]"><Link href="/login" className="font-bold text-[#0f5132]">Back to sign in</Link></p></section></main>;
}
