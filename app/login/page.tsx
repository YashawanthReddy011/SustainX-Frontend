"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Leaf, Mail, LockKeyhole, ArrowRight, ShieldCheck } from "lucide-react";

import api from "../../lib/api";
import { normalizeReturnPath, safeReturnPath } from "../../lib/return-path";

type LoginPortal = "STUDENT" | "DASHBOARD" | "ADMIN";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [portal, setPortal] = useState<LoginPortal>("STUDENT");
	const [securityKey, setSecurityKey] = useState("");
	const [challengeId, setChallengeId] = useState("");
	const [code, setCode] = useState("");
	const [notice, setNotice] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const requestedPath = typeof window === "undefined"
		? null
		: normalizeReturnPath(new URLSearchParams(window.location.search).get("next"));
	const verifyHref = requestedPath ? `/verify-email?next=${encodeURIComponent(requestedPath)}` : "/verify-email";

	async function handleLogin(event: FormEvent) {
		event.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = challengeId
				? await api.post("/auth/login/verify-code", { email, challengeId, code })
				: await api.post("/auth/login", { email, password, portal, securityKey });
			const data = response.data;

			if (data.twoFactorRequired === true && typeof data.challengeId === "string") {
				setChallengeId(data.challengeId);
				setCode("");
				setPassword("");
				setNotice(data.message || "Enter the six-digit code sent to your email.");
				return;
			}

			if (data.token) {
				localStorage.setItem("sustainx_token", data.token);
			}

			if (data.user) {
				localStorage.setItem("sustainx_user", JSON.stringify(data.user));
			}
			window.dispatchEvent(new Event("sustainx:auth-changed"));

			const requested = new URLSearchParams(window.location.search).get("next");
			window.location.href = safeReturnPath(requested);
		} catch (err: any) {
			if (err?.response?.status === 429) {
				const seconds = Number(err?.response?.data?.retryAfterSeconds);
				const wait = seconds >= 60 ? `${Math.ceil(seconds / 60)} minute(s)` : `${Math.max(1, seconds)} seconds`;
				setError(`Too many attempts. Please try again in ${wait}.`);
				return;
			}
			setError(
				err?.response?.data?.error || err?.response?.data?.message ||
				"Login failed. Check your email and password."
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="min-h-[calc(100vh-72px)] bg-[#f5f8f6]">
			<div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1200px] items-center gap-10 px-4 py-12 md:grid-cols-2">
				<div className="hidden md:block">
					<div className="section-label">
						<Leaf size={14} />
						SUSTAINX
					</div>

					<h1 className="mt-6 text-5xl font-black leading-tight text-[#153426]">
						Turn your
						<br />
						actions into
						<br />
						<span className="gradient-text">impact.</span>
					</h1>

					<p className="mt-6 max-w-lg text-base leading-8 text-[#68776f]">
						Access your SDG activities, challenges, projects, points,
						certificates and personal impact dashboard.
					</p>

					<div className="mt-8 flex items-center gap-3 text-sm font-bold text-[#496158]">
						<ShieldCheck size={19} className="text-[#0f5132]" />
						Verified impact tracking
					</div>
				</div>

				<div className="mx-auto w-full max-w-[480px]">
					<div className="sustain-card p-7 md:p-9">
						<div className="mb-8 text-center">
							<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f5132] text-white">
								<Leaf size={26} />
							</div>

							<h2 className="mt-5 text-2xl font-black text-[#173526]">
								Welcome to SustainX
							</h2>

							<p className="mt-2 text-sm text-[#748179]">
								Sign in to continue your impact journey.
							</p>
						</div>

						<form onSubmit={handleLogin} className="space-y-5">
							{!challengeId && <div>
								<label htmlFor="login-portal" className="mb-2 block text-sm font-bold text-[#405349]">Sign-in option</label>
								<select id="login-portal" value={portal} onChange={(event) => { setPortal(event.target.value as LoginPortal); setSecurityKey(""); }} className="h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm outline-none focus:border-[#74a980] focus:ring-4 focus:ring-[#dff0e2]">
									<option value="STUDENT">Student</option>
									<option value="DASHBOARD">Dashboard</option>
									<option value="ADMIN">Admin</option>
								</select>
								<p className="mt-2 text-xs text-[#748179]">Your saved account role is checked by SustainX.</p>
							</div>}
							<div>
								<label className="mb-2 block text-sm font-bold text-[#405349]">
									Email address
								</label>

								<div className="relative">
									<Mail
										size={17}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-[#839087]"
									/>

									<input
										type="email"
										required
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										disabled={Boolean(challengeId)}
										placeholder="you@example.com"
										className="h-12 w-full rounded-xl border border-[#d8e4dc] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#74a980] focus:ring-4 focus:ring-[#dff0e2]"
									/>
								</div>
							</div>

							{!challengeId && portal !== "STUDENT" && <label className="block text-sm font-bold text-[#405349]">{portal === "ADMIN" ? "Admin security key" : "Dashboard security key"}<input type="password" required autoComplete="off" value={securityKey} onChange={(event) => setSecurityKey(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-sm outline-none transition focus:border-[#74a980] focus:ring-4 focus:ring-[#dff0e2]" /></label>}

							{!challengeId ? <div>
								<div className="mb-2 flex items-center justify-between gap-3">
									<label htmlFor="password" className="block text-sm font-bold text-[#405349]">Password</label>
									<Link href="/forgot-password" className="text-xs font-bold text-[#0f5132]">Forgot password?</Link>
								</div>
								<div className="relative">
									<LockKeyhole size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#839087]" />
									<input id="password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-[#d8e4dc] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#74a980] focus:ring-4 focus:ring-[#dff0e2]" />
								</div>
							</div> : <div>
								<label htmlFor="login-code" className="mb-2 block text-sm font-bold text-[#405349]">Two-step verification code</label>
								<input id="login-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="h-12 w-full rounded-xl border border-[#d8e4dc] bg-white px-4 text-center text-lg tracking-[0.35em] outline-none transition focus:border-[#74a980] focus:ring-4 focus:ring-[#dff0e2]" />
								<p role="status" className="mt-3 text-sm leading-6 text-[#68776f]">{notice || "Enter the six-digit code sent to your email."}</p>
								<button type="button" onClick={() => { setChallengeId(""); setCode(""); setNotice(""); setError(""); }} className="mt-3 text-xs font-bold text-[#0f5132] underline">Use email and password again</button>
							</div>}

							{error && (
								<div className="rounded-xl border border-[#f0c7ca] bg-[#fff0f1] p-3 text-sm font-semibold text-[#a52b36]">
									{error}
					{error.toLowerCase().includes("verify your email") && <Link href={verifyHref} className="ml-1 underline">Resend the verification link</Link>}
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className="btn-primary w-full"
							>
								{loading ? (challengeId ? "Verifying..." : "Signing in...") : (challengeId ? "Verify and sign in" : "Sign in")}
								{!loading && <ArrowRight size={17} />}
							</button>
						</form>

						<div className="mt-7 border-t border-[#e6ece8] pt-6 text-center text-sm text-[#748179]">
							Need an account? <Link href="/register" className="font-bold text-[#0f5132]">Create one</Link>
							<p className="mt-3 text-xs">Community and administrator access is assigned by a verified administrator.</p>
						</div>
					</div>

					<div className="mt-5 text-center">
						<Link href="/" className="text-sm font-bold text-[#0f5132]">
							← Back to SustainX
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
