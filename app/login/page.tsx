"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Leaf, Mail, ArrowRight, ShieldCheck } from "lucide-react";

import api from "../../lib/api";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleLogin(event: FormEvent) {
		event.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await api.post("/auth/login", { email });
			const data = response.data;

			if (data.token) {
				localStorage.setItem("sustainx_token", data.token);
			}

			if (data.user) {
				localStorage.setItem("sustainx_user", JSON.stringify(data.user));
			}

			window.location.href = "/dashboard";
		} catch (err: any) {
			setError(
				err?.response?.data?.message ||
					"Login failed. Check your email and try again."
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
										placeholder="you@example.com"
										className="h-12 w-full rounded-xl border border-[#d8e4dc] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#74a980] focus:ring-4 focus:ring-[#dff0e2]"
									/>
								</div>
							</div>

							{error && (
								<div className="rounded-xl border border-[#f0c7ca] bg-[#fff0f1] p-3 text-sm font-semibold text-[#a52b36]">
									{error}
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className="btn-primary w-full"
							>
								{loading ? "Signing in..." : "Sign in"}
								{!loading && <ArrowRight size={17} />}
							</button>
						</form>

						<div className="mt-7 border-t border-[#e6ece8] pt-6 text-center">
							<p className="text-xs leading-5 text-[#849087]">
								Demo accounts can be created through the backend seed
								configuration.
							</p>
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
