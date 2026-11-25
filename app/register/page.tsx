"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import api from "../../lib/api";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setMessage("");
		setError("");
		try {
			const { data } = await api.post("/auth/register", { name, email, password });
			setMessage(data.message || "Check your email for a verification link.");
		} catch (e: any) {
			setError(e?.response?.data?.error || "Unable to create your account. Try again later.");
		} finally {
			setLoading(false);
		}
	}

	return <main className="min-h-[calc(100vh-72px)] bg-[#f5f8f6] px-4 py-12"><section className="sustain-card mx-auto max-w-lg p-7 md:p-9"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f5132] text-white"><Leaf size={26} /></div><h1 className="mt-5 text-2xl font-black text-[#173526]">Create your account</h1><p className="mt-2 text-sm text-[#748179]">Your account starts with student access. A verified administrator can assign other roles.</p></div>
		{message ? <div role="status" className="mt-7 rounded-xl bg-[#eaf7ed] p-4 text-sm leading-6 text-[#245c35]">{message}<p className="mt-2 text-xs">In local development, check the backend terminal for the verification link.</p></div> : <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-bold text-[#405349]">Full name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm" /></label><label className="block text-sm font-bold text-[#405349]">Email address<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm" /></label><label className="block text-sm font-bold text-[#405349]">Password<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm" /><span className="mt-1 block text-xs font-normal text-[#78857d]">Use at least 12 characters.</span></label>{error && <p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}<button disabled={loading} className="btn-primary w-full justify-center">{loading ? "Creating account…" : "Create account"}<ArrowRight size={16} /></button></form>}
		<p className="mt-6 text-center text-sm text-[#748179]">Already registered? <Link href="/login" className="font-bold text-[#0f5132]">Sign in</Link></p></section></main>;
}
