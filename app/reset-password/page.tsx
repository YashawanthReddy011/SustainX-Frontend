"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";

export default function ResetPasswordPage() {
	const [token, setToken] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") || ""), []);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		if (password !== confirmPassword) { setError("Passwords do not match."); return; }
		setLoading(true);
		try {
			const { data } = await api.post("/auth/reset-password", { token, password });
			setMessage(data.message || "Password reset. You can sign in now.");
		} catch (e: any) {
			setError(e?.response?.data?.error || "This reset link is invalid or expired.");
		} finally {
			setLoading(false);
		}
	}

	return <main className="min-h-[calc(100vh-72px)] bg-[#f5f8f6] px-4 py-12"><section className="sustain-card mx-auto max-w-lg p-7 md:p-9"><p className="text-xs font-black uppercase tracking-widest text-[#478253]">ACCOUNT RECOVERY</p><h1 className="mt-3 text-2xl font-black text-[#173526]">Choose a new password</h1>{message ? <p role="status" className="mt-6 rounded-xl bg-[#eaf7ed] p-4 text-sm text-[#245c35]">{message}</p> : <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-bold text-[#405349]">New password<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm" /></label><label className="block text-sm font-bold text-[#405349]">Confirm password<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm" /></label>{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}<button disabled={loading || !token} className="btn-primary w-full justify-center">{loading ? "Updating…" : "Update password"}</button></form>}<p className="mt-6 text-center text-sm text-[#748179]"><Link href="/login" className="font-bold text-[#0f5132]">Back to sign in</Link></p></section></main>;
}
