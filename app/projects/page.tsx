"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, FolderKanban, Leaf, Plus, RefreshCw, Search, Users } from "lucide-react";
import ProjectCard from "../../components/project-card";
import ProjectCreateModal from "../../components/forms/ProjectCreateModal";
import { getApiError, getProjects, getProjectStats, joinProject } from "../../services/platform.service";
import { useAuth } from "../../hooks/useAuth";
import type { Project, ProjectStats } from "../../types";

const pageSize = 9;
const categories = ["Environment", "Education", "Community", "Health", "Technology", "Agriculture", "Other"];

export default function ProjectsPage() {
	return <Suspense fallback={<section className="section bg-[#f7faf7]"><div className="page-container text-sm text-[#68776f]">Loading projects...</div></section>}><ProjectsPageContent /></Suspense>;
}

function ProjectsPageContent() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const { isAuthenticated } = useAuth();
	const rawSdg = searchParams.get("sdg") ?? searchParams.get("sdgId") ?? "";
	const parsedSdg = rawSdg ? Number(rawSdg) : null;
	const selectedSdg = Number.isInteger(parsedSdg) && parsedSdg !== null && parsedSdg >= 1 && parsedSdg <= 17 ? parsedSdg : null;
	const [projects, setProjects] = useState<Project[]>([]);
	const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, totalPages: 0 });
	const [stats, setStats] = useState<ProjectStats | null>(null);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("ALL");
	const [category, setCategory] = useState("");
	const [sort, setSort] = useState("newest");
	const [page, setPage] = useState(1);
	const [mine, setMine] = useState(false);
	const [loading, setLoading] = useState(true);
	const [statsLoading, setStatsLoading] = useState(true);
	const [error, setError] = useState("");
	const [statsError, setStatsError] = useState("");
	const [retryKey, setRetryKey] = useState(0);
	const [statsRetryKey, setStatsRetryKey] = useState(0);
	const [workingId, setWorkingId] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [createSdgId, setCreateSdgId] = useState<number | undefined>();
	const [notice, setNotice] = useState("");

	useEffect(() => {
		let active = true;
		setStatsLoading(true); setStatsError("");
		getProjectStats().then((value) => { if (active) setStats(value); }).catch((cause) => { if (active) { setStats(null); setStatsError(getApiError(cause, "Project statistics are unavailable.")); } }).finally(() => { if (active) setStatsLoading(false); });
		return () => { active = false; };
	}, [statsRetryKey]);

	useEffect(() => {
		const controller = new AbortController();
		let active = true;
		const timer = window.setTimeout(() => {
			setLoading(true); setError("");
			getProjects({ search: search.trim(), status, category, sort, page, limit: pageSize, ...(selectedSdg ? { sdg: selectedSdg } : {}), ...(mine ? { mine: true } : {}), signal: controller.signal })
				.then((result) => { if (active) { setProjects(result.items); setPagination(result.pagination); } })
				.catch((cause) => { if (!active || controller.signal.aborted) return; setProjects([]); setPagination({ page, limit: pageSize, total: 0, totalPages: 0 }); setError(getApiError(cause, "Unable to load projects. Check that the API and database are running.")); })
				.finally(() => { if (active) setLoading(false); });
		}, 220);
		return () => { active = false; window.clearTimeout(timer); controller.abort(); };
	}, [search, status, category, sort, page, selectedSdg, mine, retryKey]);

	useEffect(() => {
		if (selectedSdg) setCreateSdgId(selectedSdg);
		if (searchParams.get("create") === "1" && isAuthenticated) setShowCreate(true);
	}, [isAuthenticated, searchParams, selectedSdg]);

	function setSdg(value: string) {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("sdgId");
		if (value) params.set("sdg", value); else params.delete("sdg");
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
		setPage(1);
	}

	function clearFilters() {
		setSearch(""); setStatus("ALL"); setCategory(""); setSort("newest"); setMine(false); setPage(1);
		if (selectedSdg) router.replace(pathname, { scroll: false });
	}

	async function requestToJoin(id: string) {
		setWorkingId(id); setError("");
		try {
			const result = await joinProject(id);
			setProjects((current) => current.map((project) => project.id === id ? { ...project, membershipStatus: result.status, joined: result.status === "APPROVED", participantCount: result.status === "APPROVED" ? (project.participantCount ?? 0) + 1 : project.participantCount } : project));
			setNotice(result.message);
		} catch (cause) { setError(getApiError(cause, "Unable to request project membership.")); }
		finally { setWorkingId(""); }
	}

	const statValue = (value: number | undefined) => statsLoading ? "Loading..." : statsError || typeof value !== "number" ? "Unavailable" : value.toLocaleString();

	return <section className="section bg-[#f7faf7]"><div className="page-container">
		<header className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#103f2b] px-6 py-9 text-white sm:px-10 sm:py-11"><div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full border-[32px] border-white/5" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#c7efce]"><FolderKanban size={14} />Collaborate</div><h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">Impact projects</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[#d1e3d7] sm:text-base">Discover, collaborate and build practical sustainability projects with students and communities.</p></div>{isAuthenticated ? <button type="button" onClick={() => { setCreateSdgId(selectedSdg ?? undefined); setShowCreate(true); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]"><Plus size={17} />Create a project</button> : <Link href="/login?next=%2Fprojects" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]"><Plus size={17} />Sign in to create</Link>}</div></header>

		<div className="mb-7 grid gap-4 sm:grid-cols-3"><Stat icon={FolderKanban} label="Published projects" value={statValue(stats?.publishedProjects)} /><Stat icon={Users} label="Unique participants" value={statValue(stats?.uniqueParticipants)} /><Stat icon={Leaf} label="SDGs with verified project impact" value={statValue(stats?.verifiedSdgs)} /></div>
		{statsError && <div role="status" className="-mt-4 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#7b8980]">Project statistics could not be loaded.<button type="button" onClick={() => setStatsRetryKey((value) => value + 1)} className="inline-flex items-center gap-1.5 font-bold text-[#0f5132]"><RefreshCw size={13} />Retry statistics</button></div>}

		<div className="mb-5 rounded-2xl border border-[#dce7df] bg-white p-4 shadow-sm sm:p-5"><label className="relative mb-4 block"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#809187]" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by project name, goal or keyword..." aria-label="Search projects" className="h-12 w-full rounded-xl border border-[#d8e4dc] bg-[#fbfdfb] pl-11 pr-4 text-sm text-[#173526] outline-none placeholder:text-[#89958e] focus:border-[#74a980] focus:ring-4 focus:ring-[#74a980]/10" /></label><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Select label="SDG" value={selectedSdg ? String(selectedSdg) : ""} onChange={setSdg}><option value="">All SDGs</option>{Array.from({ length: 17 }, (_, index) => <option key={index + 1} value={index + 1}>SDG {index + 1}</option>)}</Select><Select label="Category" value={category} onChange={(value) => { setCategory(value); setPage(1); }}><option value="">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</Select><Select label="Sort by" value={sort} onChange={(value) => { setSort(value); setPage(1); }}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="popular">Most members</option><option value="deadline">Ending soon</option></Select><Select label="Project status" value={status} onChange={(value) => { setStatus(value); setPage(1); }}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="UPCOMING">Upcoming</option><option value="COMPLETED">Completed</option>{mine && <><option value="PENDING">Pending review</option><option value="DRAFT">Draft</option><option value="REJECTED">Needs changes</option><option value="ARCHIVED">Archived</option></>}</Select></div></div>

		{selectedSdg && <div className="sustain-card mb-5 flex flex-wrap items-center justify-between gap-3 px-5 py-4"><p className="text-sm text-[#52645a]">Showing projects connected to <Link href={`/sdgs/${selectedSdg}`} className="font-extrabold text-[#0f5132] hover:underline">SDG {selectedSdg}</Link></p><button type="button" onClick={() => setSdg("")} className="text-sm font-bold text-[#0f5132] hover:underline">Clear SDG filter</button></div>}
		{notice && <div role="status" className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-[#e8f5eb] p-3 text-sm text-[#28643a]">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" className="font-bold">×</button></div>}
		{error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]"><span>{error}</span><button type="button" onClick={() => setRetryKey((value) => value + 1)} className="inline-flex items-center gap-1 font-bold underline"><RefreshCw size={14} />Retry</button></div>}
		<div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-[#789087]">BUILD TOGETHER</p><h2 className="mt-1 text-2xl font-black text-[#153426]">{mine ? "My projects" : "Explore impact projects"}</h2><p className="mt-1 text-sm text-[#738178]">{loading ? "Loading projects..." : error ? "" : `${pagination.total.toLocaleString()} ${pagination.total === 1 ? "project" : "projects"} found`}</p></div>{isAuthenticated && <button type="button" onClick={() => { setMine((value) => !value); setPage(1); setStatus("ALL"); }} className={`rounded-full px-4 py-2 text-xs font-bold ${mine ? "bg-[#0f5132] text-white" : "border border-[#d9e5dc] bg-white text-[#587064]"}`}>{mine ? "Viewing my projects" : "My projects"}</button>}</div>

		{loading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading projects">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl border border-[#e1e9e3] bg-white" />)}</div> : error ? null : projects.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} joined={Boolean(project.joined || project.membershipStatus === "PENDING" || project.membershipStatus === "APPROVED")} joining={workingId === project.id} isAuthenticated={isAuthenticated} onJoin={() => void requestToJoin(project.id)} />)}</div> : <div className="rounded-2xl border border-dashed border-[#cbd9ce] bg-white px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf6ef] text-[#0f5132]"><FolderKanban size={20} /></div><h3 className="mt-4 text-lg font-extrabold text-[#173526]">{mine ? "No projects in this view" : "No projects found"}</h3><p className="mt-2 text-sm text-[#718278]">{mine ? "Projects you create, join or request to join will appear here." : selectedSdg ? `No published projects are connected to SDG ${selectedSdg} with these filters.` : "Try different filters or propose a new community project."}</p><button type="button" onClick={clearFilters} className="btn-secondary mt-5">Clear filters</button></div>}
		{!loading && !error && pagination.totalPages > 1 && <nav aria-label="Project pages" className="mt-8 flex items-center justify-center gap-4"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="btn-secondary disabled:opacity-50"><ChevronLeft size={16} />Previous</button><span className="text-sm font-semibold text-[#66766d]">Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="btn-secondary disabled:opacity-50">Next<ChevronRight size={16} /></button></nav>}

		<div className="mt-9 rounded-2xl bg-[#0f5132] p-7 text-white"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 className="text-xl font-black">Have an idea for change?</h2><p className="mt-2 text-sm text-[#bdd5c5]">Build a project with other students and turn your idea into measurable impact.</p></div>{isAuthenticated ? <button type="button" onClick={() => { setCreateSdgId(selectedSdg ?? undefined); setShowCreate(true); }} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">Start a project<Plus size={16} /></button> : <Link href="/login?next=%2Fprojects" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">Sign in to start<ArrowRight size={16} /></Link>}</div></div>
		{showCreate && <ProjectCreateModal initialSdgId={createSdgId} onClose={() => setShowCreate(false)} onCreated={(project) => { setNotice(project.message ?? "Project submitted for review."); setMine(true); setPage(1); setRetryKey((value) => value + 1); }} />}
	</div></section>;
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#819087]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-[#d8e4dc] bg-[#fbfdfb] px-3 text-sm font-semibold text-[#405349] outline-none focus:border-[#74a980] focus:ring-4 focus:ring-[#74a980]/10">{children}</select></label>; }
function Stat({ icon: Icon, label, value }: { icon: typeof FolderKanban; label: string; value: string }) { return <article className="rounded-2xl border border-[#dce7df] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[#718278]">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf6ef] text-[#0f5132]"><Icon size={18} /></span></div><p className="mt-4 text-3xl font-black tracking-tight text-[#0f5132]" aria-live="polite">{value}</p></article>; }
