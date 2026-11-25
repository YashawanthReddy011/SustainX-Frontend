"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CountRow = { name: string; count: number };

export function ProjectProgressChart({ data }: { data: Array<{ id: string; title: string; progress: number }> }) {
	return <ChartCard title="Project progress" subtitle="Progress reported for projects you joined">
		{data.length === 0 ? <EmptyChart>No project progress to show yet. Join or create a project to see it here.</EmptyChart> : <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: 8, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#e4ebe6" horizontal={false} /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 11 }} /><YAxis type="category" dataKey="title" width={125} axisLine={false} tickLine={false} tick={{ fill: "#66766d", fontSize: 11 }} /><Tooltip formatter={(value) => [`${value}%`, "Progress"]} /><Bar dataKey="progress" name="Progress" fill="#367b49" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div>}
	</ChartCard>;
}

export function StatusBreakdownChart({ title, subtitle, data }: { title: string; subtitle: string; data: CountRow[] }) {
	const hasValues = data.some((item) => item.count > 0);
	return <ChartCard title={title} subtitle={subtitle}>
		{!hasValues ? <EmptyChart>No records have been counted for this view yet.</EmptyChart> : <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#e4ebe6" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#66766d", fontSize: 10 }} interval={0} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 11 }} /><Tooltip /><Bar dataKey="count" name="Records" fill="#367b49" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>}
	</ChartCard>;
}

export function MonthlyCountChart({ title, subtitle, label, data }: { title: string; subtitle: string; label: string; data: Array<{ month: string; count: number }> }) {
	const hasValues = data.some((item) => item.count > 0);
	return <ChartCard title={title} subtitle={subtitle}>
		{!hasValues ? <EmptyChart>No records were created during this period.</EmptyChart> : <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}><defs><linearGradient id="monthlyCountFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f9b59" stopOpacity={0.32} /><stop offset="100%" stopColor="#4f9b59" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e4ebe6" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 11 }} /><Tooltip /><Area type="monotone" dataKey="count" name={label} stroke="#327742" strokeWidth={3} fill="url(#monthlyCountFill)" /></AreaChart></ResponsiveContainer></div>}
	</ChartCard>;
}

export function AdminActivityTrendChart({ data }: { data: Array<{ month: string; activities: number; verifiedActivities: number; users: number }> }) {
	const hasValues = data.some((item) => item.activities > 0 || item.verifiedActivities > 0 || item.users > 0);
	return <ChartCard title="Platform growth" subtitle="Submissions, verified actions and new users by month">
		{!hasValues ? <EmptyChart>No activity or account registrations were recorded during this period.</EmptyChart> : <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}><defs><linearGradient id="adminVerifiedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#367b49" stopOpacity={0.32} /><stop offset="100%" stopColor="#367b49" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e4ebe6" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#7b8981", fontSize: 11 }} /><Tooltip /><Area type="monotone" dataKey="activities" name="Submissions" stroke="#9aac9f" fill="none" strokeWidth={2} /><Area type="monotone" dataKey="verifiedActivities" name="Verified actions" stroke="#327742" fill="url(#adminVerifiedFill)" strokeWidth={3} /><Area type="monotone" dataKey="users" name="New users" stroke="#4b86b0" fill="none" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>}
	</ChartCard>;
}

export function EnvironmentalMonthlyChart({ data }: { data: Array<{ month: string; verifiedSubmissions: number }> }) {
	return <MonthlyCountChart title="Environmental impact" subtitle="Verified EcoGuard submissions over the last six months" label="Verified submissions" data={data.map((item) => ({ month: item.month, count: item.verifiedSubmissions }))} />;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
	return <div className="sustain-card p-5"><div className="mb-5"><h3 className="font-extrabold text-[#173526]">{title}</h3><p className="mt-1 text-xs text-[#77857d]">{subtitle}</p></div>{children}</div>;
}

function EmptyChart({ children }: { children: React.ReactNode }) {
	return <div className="flex h-[280px] items-center justify-center px-6 text-center text-sm leading-6 text-[#89958e]">{children}</div>;
}
