"use client";

import Link from "next/link";
import { Activity, ArrowRight, Award, BarChart3, Bell, CheckCircle2, Clock3, Flag, Leaf, LogOut, MessageCircle, Target, Trophy, Users, XCircle } from "lucide-react";
import type { AdminDashboardData, DashboardData, Role } from "../../types";
import ActivityCard from "../activity-card";
import { ActivityChart, SDGImpactChart } from "../charts";
import { AdminActivityTrendChart, EnvironmentalMonthlyChart, MonthlyCountChart, ProjectProgressChart, StatusBreakdownChart } from "../charts/analytics";

export default function ImpactDashboard({
	role, name, data, adminData, loadingAdmin, refreshing, onRefresh, onLogout, onSubmitActivity,
}: {
	role: Role;
	name: string;
	data: DashboardData;
	adminData: AdminDashboardData | null;
	loadingAdmin: boolean;
	refreshing: boolean;
	onRefresh: () => void;
	onLogout: () => void;
	onSubmitActivity: () => void;
}) {
	const isAdmin = role === "ADMIN";
	const isCommunity = role === "COMMUNITY";
	const heading = isAdmin ? "Platform analytics" : isCommunity ? "Community impact dashboard" : "My Impact Dashboard";
	const intro = isAdmin ? "A current view of verified impact, platform participation and moderation workload." : isCommunity ? "Track reports, community projects and verified environmental contributions." : "See your verified actions and the progress you have made across SustainX.";

	return <section className="min-h-screen bg-[#f5f8f6] py-8"><div className="page-container">
		<header className="mb-6 flex flex-col justify-between gap-5 rounded-2xl bg-[#0b4129] p-6 text-white md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9cdb3]">{isAdmin ? "ADMINISTRATION" : isCommunity ? "COMMUNITY" : "PERSONAL IMPACT"}</p><h1 className="mt-2 text-2xl font-black md:text-3xl">{heading}</h1><p className="mt-2 text-sm text-[#bdd5c5]">{name ? `Welcome, ${name}. ` : ""}{intro}</p></div><div className="flex flex-wrap gap-2"><button onClick={onRefresh} disabled={refreshing} className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-60"><BarChart3 size={16} className="mr-2 inline" />{refreshing ? "Refreshing…" : "Refresh data"}</button><button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15"><LogOut size={16} />Logout</button></div></header>

		{isAdmin ? <AdminView data={adminData} loading={loadingAdmin} /> : isCommunity ? <CommunityView data={data} /> : <StudentView data={data} onSubmitActivity={onSubmitActivity} />}
		{!isAdmin && <Notifications data={data} />}
	</div></section>;
}

function StudentView({ data, onSubmitActivity }: { data: DashboardData; onSubmitActivity: () => void }) {
	const stats = data.stats;
	return <>
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={CheckCircle2} value={stats.verifiedActivities} label="Verified actions" /><Metric icon={Trophy} value={stats.totalPoints} label="Impact points" /><Metric icon={Users} value={stats.projects} label="Projects joined" /><Metric icon={Award} value={stats.certificates} label="Certificates" /></div>
		<div className="mt-6 grid gap-5 xl:grid-cols-2"><ActivityChart data={data.activityGrowth} /><SDGImpactChart data={data.sdgImpact} /></div>
		<div className="mt-6 grid gap-5 xl:grid-cols-2"><ProjectProgressChart data={data.projectProgress} /><EnvironmentalMonthlyChart data={data.environmentalImpact.monthly} /></div>
		<EnvironmentalTotals data={data.environmentalImpact} />
		<div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1.25fr]"><section className="sustain-card p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-[#173526]">My challenges</h2><p className="mt-1 text-xs text-[#77857d]">Challenge registrations on your account</p></div><Link href="/challenges" className="text-xs font-bold text-[#0f5132]">Browse<ArrowRight size={13} className="ml-1 inline" /></Link></div>{data.joinedChallenges.length ? <div className="space-y-2">{data.joinedChallenges.map((challenge) => <Link href={`/challenges/${encodeURIComponent(challenge.id)}`} key={challenge.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f8f5] p-3 hover:bg-[#edf6ef]"><div className="min-w-0"><p className="truncate text-sm font-bold text-[#30483b]">{challenge.title}</p><p className="mt-1 text-[11px] text-[#87938c]">{challenge.participants.toLocaleString()} participants · {challenge.points.toLocaleString()} points</p></div><span className="badge badge-green">{challenge.status}</span></Link>)}</div> : <EmptyState>Join a challenge to see your registrations here.</EmptyState>}</section>
			<RecentActivities data={data} onSubmitActivity={onSubmitActivity} /></div>
		<div className="mt-6"><Leaderboard data={data} /></div>
	</>;
}

function CommunityView({ data }: { data: DashboardData }) {
	const stats = data.stats;
	const reportStatuses = data.communityAnalytics.reportsByStatus.map((item) => ({ name: item.status.replaceAll("_", " "), count: item.count }));
	const monthlyReports = data.communityAnalytics.monthlyReports.map((item) => ({ month: item.month, count: item.reports }));
	return <>
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Flag} value={stats.reportsSubmitted} label="Reports submitted" /><Metric icon={CheckCircle2} value={stats.reportsResolved} label="Reports resolved" /><Metric icon={Users} value={stats.projects} label="Community projects" /><Metric icon={MessageCircle} value={stats.discussionGroups} label="Group discussions" /></div>
		<div className="mt-6 grid gap-5 xl:grid-cols-2"><MonthlyCountChart title="Reports over time" subtitle="Reports you submitted during the last six months" label="Reports" data={monthlyReports} /><StatusBreakdownChart title="Community issue status" subtitle="Current status of your submitted reports" data={reportStatuses} /></div>
		<div className="mt-6 grid gap-5 xl:grid-cols-2"><ProjectProgressChart data={data.projectProgress} /><EnvironmentalMonthlyChart data={data.environmentalImpact.monthly} /></div>
		<EnvironmentalTotals data={data.environmentalImpact} />
		<div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><section className="sustain-card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-extrabold text-[#173526]">Recent reports</h2><p className="mt-1 text-xs text-[#77857d]">Latest reports submitted by your account</p></div><Link href="/community" className="text-xs font-bold text-[#0f5132]">Community page<ArrowRight size={13} className="ml-1 inline" /></Link></div>{data.communityAnalytics.recentReports.length ? <div className="space-y-2">{data.communityAnalytics.recentReports.map((report) => <div key={report.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f8f5] p-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-[#30483b]">{report.title}</p><p className="mt-1 text-[11px] text-[#87938c]">{new Date(report.createdAt).toLocaleDateString()}</p></div><span className="badge badge-blue">{report.status.replaceAll("_", " ")}</span></div>)}</div> : <EmptyState>You have not submitted a community report yet.</EmptyState>}</section><RecentActivities data={data} /></div>
		<div className="mt-6"><Leaderboard data={data} /></div>
	</>;
}

function AdminView({ data, loading }: { data: AdminDashboardData | null; loading: boolean }) {
	if (loading || !data) return <div className="sustain-card p-8 text-sm text-[#68776f]">{loading ? "Loading administrator analytics…" : "Administrator analytics are unavailable."}</div>;
	const stats = data.stats;
	const projects = data.projectStatuses.map((item) => ({ name: item.status.replaceAll("_", " "), count: item.count }));
	const reports = data.reportStatuses.map((item) => ({ name: item.status.replaceAll("_", " "), count: item.count }));
	return <>
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"><Metric icon={Users} value={stats.users} label="Total users" /><Metric icon={Users} value={stats.activeUsers} label="Active users" /><Metric icon={CheckCircle2} value={stats.verifiedActivities} label="Verified actions" /><Metric icon={Clock3} value={stats.pendingActivities} label="Pending approvals" /><Metric icon={Target} value={stats.sdgsCovered} label="SDGs covered" /><Metric icon={Flag} value={stats.reports} label="Community reports" /></div>
		<div className="mt-6"><AdminActivityTrendChart data={data.activityGrowth} /></div>
		<div className="mt-6 grid gap-5 xl:grid-cols-2"><SDGImpactChart data={data.sdgImpact} /><StatusBreakdownChart title="Project statistics" subtitle={`${stats.projects.toLocaleString()} projects · ${stats.participants.toLocaleString()} participants`} data={projects} /></div>
		<div className="mt-6 grid gap-5 xl:grid-cols-2"><StatusBreakdownChart title="Community reports" subtitle={`${stats.pendingReports.toLocaleString()} awaiting review · ${stats.resolvedReports.toLocaleString()} resolved`} data={reports} /><EnvironmentalTotals data={data.environmentalImpact} /></div>
		<section className="sustain-card mt-6 overflow-hidden"><div className="border-b border-[#e5ece7] p-5"><h2 className="font-extrabold text-[#173526]">Administrator audit log</h2><p className="mt-1 text-xs text-[#77857d]">Recorded moderation, review and management actions</p></div>{data.recentAuditLogs.length ? <div className="divide-y divide-[#edf1ee]">{data.recentAuditLogs.map((entry) => <div key={entry.id} className="flex flex-wrap items-start justify-between gap-3 p-4"><div><p className="text-sm font-bold text-[#30483b]">{entry.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-[#748179]">{entry.details} · {entry.targetType.replaceAll("_", " ")} {entry.targetId}</p><p className="mt-1 text-[11px] text-[#8a968f]">{entry.actor}</p></div><time className="text-[11px] text-[#8a968f]">{new Date(entry.createdAt).toLocaleString()}</time></div>)}</div> : <EmptyState>Audit entries will appear after an administrator reviews or changes platform records.</EmptyState>}</section>
	</>;
}

function EnvironmentalTotals({ data }: { data: DashboardData["environmentalImpact"] | AdminDashboardData["environmentalImpact"] }) {
	return <section className="mt-6"><div className="mb-3"><h2 className="font-extrabold text-[#173526]">Verified environmental units</h2><p className="mt-1 text-xs text-[#77857d]">Totals from approved EcoGuard submissions</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SmallMetric icon={Leaf} label="Trees planted" value={data.trees} unit="trees" /><SmallMetric icon={Activity} label="Water conserved" value={data.litres} unit="litres" /><SmallMetric icon={BarChart3} label="Waste reduced" value={data.wasteKg} unit="kg" /><SmallMetric icon={Target} label="Species observed" value={data.speciesObservations} unit="observations" /></div></section>;
}

function Leaderboard({ data }: { data: DashboardData }) {
	const hasPoints = data.leaderboard.topUsers.some((item) => item.points > 0);
	return <section className="sustain-card p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-[#173526]">Verified impact leaderboard</h2><p className="mt-1 text-xs text-[#77857d]">Ranked by points from verified actions</p></div>{hasPoints && <span className="rounded-xl bg-[#e8f5eb] px-3 py-2 text-xs font-black text-[#256b39]">Your rank #{data.leaderboard.userRank}</span>}</div>{!hasPoints ? <EmptyState>No verified impact points have been recorded yet.</EmptyState> : <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{data.leaderboard.topUsers.map((item) => <div key={item.id} className={`rounded-xl p-3 ${item.id === data.user?.id ? "bg-[#e6f4e9] ring-1 ring-[#a9ceb1]" : "bg-[#f5f8f5]"}`}><p className="text-[11px] font-black text-[#75847b]">#{item.rank}</p><p className="mt-1 truncate text-sm font-bold text-[#30483b]">{item.name}{item.id === data.user?.id ? " (you)" : ""}</p><p className="mt-1 text-xs text-[#75847b]">{item.points.toLocaleString()} points</p></div>)}</div>}</section>;
}

function RecentActivities({ data, onSubmitActivity }: { data: DashboardData; onSubmitActivity?: () => void }) {
	return <section className="sustain-card p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-[#173526]">Recent activities</h2><p className="mt-1 text-xs text-[#77857d]">Your latest activity submissions and review status</p></div>{onSubmitActivity && <button onClick={onSubmitActivity} className="text-xs font-bold text-[#0f5132]">Submit activity<ArrowRight size={13} className="ml-1 inline" /></button>}</div>{data.activities.length ? <div className="space-y-3">{data.activities.slice(0, 4).map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div> : <EmptyState>No activity submissions have been recorded for your account.</EmptyState>}</section>;
}

function Notifications({ data }: { data: DashboardData }) {
	return <section className="sustain-card mt-6 p-5"><div className="mb-4 flex items-center gap-2"><Bell size={18} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Recent notifications</h2></div>{data.notifications.length ? <div className="grid gap-3 md:grid-cols-2">{data.notifications.slice(0, 4).map((item) => <div key={item.id} className="rounded-xl bg-[#eef8f1] p-4"><div className="flex gap-3"><NotificationIcon title={item.title} /><div><p className="text-sm font-bold text-[#284b36]">{item.title}</p><p className="mt-1 text-xs leading-5 text-[#718078]">{item.message}</p></div></div></div>)}</div> : <p className="text-sm text-[#7a8880]">No notifications have been recorded for your account.</p>}</section>;
}

function Metric({ icon: Icon, value, label }: { icon: typeof Trophy; value: number; label: string }) {
	return <div className="sustain-card p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f5ea] text-[#0f5132]"><Icon size={19} /></div><div className="mt-4 text-2xl font-black text-[#173526]">{value.toLocaleString()}</div><p className="mt-1 text-xs font-bold text-[#7d8a82]">{label}</p></div>;
}

function SmallMetric({ icon: Icon, label, value, unit }: { icon: typeof Leaf; label: string; value: number; unit: string }) {
	return <div className="sustain-card flex items-center gap-3 p-4"><Icon size={18} className="shrink-0 text-[#0f5132]" /><div><p className="text-[11px] text-[#7d8a82]">{label}</p><p className="font-black text-[#173526]">{value.toLocaleString()} <span className="text-[10px] font-medium text-[#87938c]">{unit}</span></p></div></div>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
	return <p className="rounded-xl bg-[#f7faf7] p-5 text-sm leading-6 text-[#7b8981]">{children}</p>;
}

function NotificationIcon({ title }: { title: string }) {
	if (title.toLowerCase().includes("reject") || title.toLowerCase().includes("not approved")) return <XCircle size={18} className="mt-0.5 shrink-0 text-[#b12d3b]" />;
	if (title.toLowerCase().includes("verified")) return <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#3e8b4e]" />;
	return <Clock3 size={18} className="mt-0.5 shrink-0 text-[#a27700]" />;
}
