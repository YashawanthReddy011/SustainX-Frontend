"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity as ActivityIcon, Award, Bell, BarChart3, CheckCircle2, Clock3, Leaf, LogOut, Target, Trophy, Upload, XCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ActivityCard from "../../components/activity-card";
import { ActivityChart, SDGImpactChart } from "../../components/charts";
import ActivitySubmitModal from "../../components/forms/ActivitySubmitModal";
import { getApiError, getDashboard } from "../../services/platform.service";
import type { DashboardData } from "../../types";

export default function DashboardPage() {
	const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
	const [data, setData] = useState<DashboardData | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showSubmit, setShowSubmit] = useState(false);
	async function refresh() { try { setData(await getDashboard()); setError(""); } catch (e) { setError(getApiError(e, "Unable to load your impact data. Check that the API is running.")); } finally { setLoading(false); } }
	useEffect(() => { if (authLoading) return; if (isAuthenticated) { setLoading(true); void refresh(); } else { setData(null); setLoading(false); } }, [authLoading, isAuthenticated]);
	if (authLoading || loading) return <section className="section"><div className="page-container">Loading dashboard…</div></section>;
	if (!isAuthenticated) return <section className="section bg-[#f5f8f6]"><div className="page-container"><div className="sustain-card mx-auto max-w-xl p-8 text-center"><h1 className="text-2xl font-black text-[#173526]">Your impact dashboard</h1><p className="mt-3 text-sm leading-6 text-[#68776f]">Sign in to see activities, points and verified impact saved to your account.</p><Link href="/login?next=%2Fdashboard" className="btn-primary mt-6">Sign in</Link></div></div></section>;
	const stats = data?.stats; const points = stats?.totalPoints ?? user?.impactPoints ?? 0; const level = points >= 3000 ? "Impact Leader" : points >= 1000 ? "Impact Builder" : "Impact Starter"; const nextLevel = points >= 3000 ? 5000 : points >= 1000 ? 3000 : 1000; const progress = Math.min(100, Math.round((points / nextLevel) * 100));
	return <section className="min-h-screen bg-[#f5f8f6] py-8"><div className="page-container"><div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-[#0b4129] p-6 text-white md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-widest text-[#a9cdb3]">PERSONAL IMPACT DASHBOARD</p><h1 className="mt-2 text-2xl font-black md:text-3xl">Welcome{user?.name ? `, ${user.name}` : ""}.</h1><p className="mt-2 text-sm text-[#bdd5c5]">Track your actions, points and verified impact.</p></div><button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"><LogOut size={16} />Logout</button></div>
		{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={Trophy} value={points} label="Impact Points" /><Stat icon={ActivityIcon} value={stats?.totalActivities ?? 0} label="Activities" /><Stat icon={Target} value={stats?.sdgsImpacted ?? 0} label="SDGs Impacted" /><Stat icon={Award} value={stats?.certificates ?? 0} label="Certificates" /></div>
		<div className="mt-6 grid gap-5 lg:grid-cols-2"><ActivityChart data={data?.activityGrowth ?? []} /><SDGImpactChart data={data?.sdgImpact ?? []} /></div>
		<div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-[#173526]">Recent Activities</h2><button onClick={() => setShowSubmit(true)} className="flex items-center gap-2 text-sm font-bold text-[#0f5132]"><Upload size={16} />Submit Activity</button></div><div className="space-y-4">{data?.activities.length ? data.activities.slice(0, 5).map((activity) => <ActivityCard key={activity.id} activity={activity} />) : <div className="sustain-card p-6 text-sm text-[#68776f]">No activities yet. Submit your first action to start tracking impact.</div>}</div></div>
			<div className="space-y-5"><div className="sustain-card p-6"><div className="flex items-center gap-3"><Bell size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Notifications</h2></div><div className="mt-5 space-y-3">{data?.notifications.length ? data.notifications.map((item) => <div key={item.id} className="rounded-xl bg-[#eef8f1] p-4"><div className="flex gap-3"><NotificationIcon title={item.title} /><div><p className="text-sm font-bold text-[#284b36]">{item.title}</p><p className="mt-1 text-xs leading-5 text-[#718078]">{item.message}</p></div></div></div>) : <p className="text-sm text-[#7a8880]">No notifications yet.</p>}</div></div>
				<div className="sustain-card p-6"><div className="flex items-center gap-3"><Leaf size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Current Level</h2></div><div className="mt-5 flex items-end justify-between"><div><div className="text-3xl font-black text-[#0f5132]">{level}</div><p className="mt-1 text-xs text-[#7c8a82]">{Math.max(0, nextLevel - points).toLocaleString()} points to next level</p></div><BarChart3 className="text-[#74ad7b]" /></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e6eee8]"><div className="h-full rounded-full bg-[#4f9957] transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-[#7c8a82]">{points.toLocaleString()} / {nextLevel.toLocaleString()} points</p></div>
			</div></div>
		{showSubmit && <ActivitySubmitModal onClose={() => setShowSubmit(false)} onCreated={() => { void refresh(); }} />}
	</div></section>;
}

function Stat({ icon: Icon, value, label }: { icon: typeof Trophy; value: number; label: string }) { return <div className="sustain-card p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f5ea] text-[#0f5132]"><Icon size={20} /></div><div className="mt-5 text-3xl font-black text-[#173526]">{value.toLocaleString()}</div><p className="mt-1 text-xs font-bold text-[#7d8a82]">{label}</p></div>; }
function NotificationIcon({ title }: { title: string }) { if (title.toLowerCase().includes("reject")) return <XCircle size={18} className="mt-0.5 text-[#b12d3b]" />; if (title.toLowerCase().includes("verified")) return <CheckCircle2 size={18} className="mt-0.5 text-[#3e8b4e]" />; return <Clock3 size={18} className="mt-0.5 text-[#a27700]" />; }
