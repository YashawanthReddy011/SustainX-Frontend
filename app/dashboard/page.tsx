"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import ImpactDashboard from "../../components/dashboard/ImpactDashboard";
import ActivitySubmitModal from "../../components/forms/ActivitySubmitModal";
import { getAdminDashboard, getApiError, getDashboard } from "../../services/platform.service";
import type { AdminDashboardData, DashboardData } from "../../types";

export default function DashboardPage() {
	const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
	const [data, setData] = useState<DashboardData | null>(null);
	const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingAdmin, setLoadingAdmin] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");
	const [showSubmit, setShowSubmit] = useState(false);

	const refresh = useCallback(async (showPageLoader = false) => {
		if (showPageLoader) setLoading(true);
		setRefreshing(true);
		setError("");
		try {
			const dashboard = await getDashboard(user?.role);
			setData(dashboard);
			const role = dashboard.user?.role ?? user?.role;
			if (role === "ADMIN") {
				setLoadingAdmin(true);
				try { setAdminData(await getAdminDashboard()); }
				catch (cause) { setError(getApiError(cause, "Unable to load administrator analytics.")); }
				finally { setLoadingAdmin(false); }
			} else {
				setAdminData(null);
			}
		} catch (cause) {
			setError(getApiError(cause, "Unable to load dashboard data. Check that the API is running."));
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [user?.role]);

	useEffect(() => {
		if (authLoading) return;
		if (isAuthenticated) void refresh(true);
		else { setData(null); setAdminData(null); setLoading(false); }
	}, [authLoading, isAuthenticated, refresh]);

	if (authLoading || loading) return <section className="section"><div className="page-container text-sm text-[#68776f]">Loading your dashboard…</div></section>;
	if (!isAuthenticated) return <section className="section bg-[#f5f8f6]"><div className="page-container"><div className="sustain-card mx-auto max-w-xl p-8 text-center"><h1 className="text-2xl font-black text-[#173526]">Your impact dashboard</h1><p className="mt-3 text-sm leading-6 text-[#68776f]">Sign in to see role-specific impact and analytics saved to your account.</p><Link href="/login?next=%2Fdashboard" className="btn-primary mt-6">Sign in</Link></div></div></section>;
	if (error && !data) return <section className="section"><div className="page-container"><p role="alert" className="sustain-card p-6 text-sm text-[#a52b36]">{error}</p><button onClick={() => void refresh(true)} className="btn-primary mt-5">Try again</button></div></section>;
	if (!data) return null;

	return <>
		{error && <div className="page-container pt-5"><p role="alert" className="rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p></div>}
		<ImpactDashboard role={data.user?.role ?? user?.role ?? "STUDENT"} name={data.user?.name ?? user?.name ?? ""} data={data} adminData={adminData} loadingAdmin={loadingAdmin} refreshing={refreshing} onRefresh={() => void refresh()} onLogout={() => void logout()} onSubmitActivity={() => setShowSubmit(true)} />
		{showSubmit && <ActivitySubmitModal onClose={() => setShowSubmit(false)} onCreated={() => { setShowSubmit(false); void refresh(); }} />}
	</>;
}
