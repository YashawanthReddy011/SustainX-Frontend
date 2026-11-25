"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Users, Leaf } from "lucide-react";
import ProjectCard from "../../components/project-card";
import ProjectCreateModal from "../../components/forms/ProjectCreateModal";
import { getApiError, getProjects, getPublicSummary, joinProject } from "../../services/platform.service";
import { useAuth } from "../../hooks/useAuth";
import type { Project } from "../../types";

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showCreate, setShowCreate] = useState(false); const [createSdgId, setCreateSdgId] = useState<number | undefined>(); const [workingId, setWorkingId] = useState("");
	const [summary, setSummary] = useState<Awaited<ReturnType<typeof getPublicSummary>> | null>(null); const [summaryLoading, setSummaryLoading] = useState(true); const [summaryError, setSummaryError] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const { isAuthenticated } = useAuth();
	useEffect(() => { getProjects().then(setProjects).catch((e) => setError(getApiError(e, "Unable to load projects. Check that the API is running."))).finally(() => setLoading(false)); }, []);
	useEffect(() => { getPublicSummary().then(setSummary).catch((e) => setSummaryError(getApiError(e, "Unable to load live project statistics."))).finally(() => setSummaryLoading(false)); }, []);
	useEffect(() => { const query = new URLSearchParams(window.location.search); const requestedSdg = Number(query.get("sdgId")); if (Number.isInteger(requestedSdg) && requestedSdg >= 1 && requestedSdg <= 17) setCreateSdgId(requestedSdg); if (query.get("create") === "1" && isAuthenticated) setShowCreate(true); }, [isAuthenticated]);
	const visibleProjects = useMemo(() => statusFilter === "ALL" ? projects : projects.filter((project) => (project.status ?? "ACTIVE") === statusFilter), [projects, statusFilter]);
	const statValue = (value: number | undefined) => summaryLoading ? "Loading…" : summaryError || typeof value !== "number" ? "Unavailable" : value.toLocaleString();
	async function join(id: string) { setWorkingId(id); setError(""); try { const result = await joinProject(id); setProjects((items) => items.map((project) => project.id === id ? { ...project, joined: result.joined, members: result.members } : project)); } catch (e) { setError(getApiError(e, "Unable to join the project. Please sign in and try again.")); } finally { setWorkingId(""); } }
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="section-label"><FolderKanban size={14} />COLLABORATE</div><h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">Impact Projects</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">Discover projects created by students and communities around practical sustainability goals.</p></div>{isAuthenticated ? <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={17} />Create Project</button> : <Link href="/login?next=%2Fprojects" className="btn-primary"><Plus size={17} />Sign in to create</Link>}</div>
		{error && <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36] sm:flex-row sm:items-center sm:justify-between"><p>{error}</p><button onClick={() => window.location.reload()} className="font-bold underline">Try again</button></div>}
		{summaryError && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]"><span>{summaryError}</span><button onClick={() => window.location.reload()} className="font-bold underline">Try again</button></div>}
		<div className="mb-8 grid gap-4 sm:grid-cols-3"><Stat icon={FolderKanban} value={statValue(summary?.impactProjects)} label="Published impact projects" /><Stat icon={Users} value={statValue(summary?.participants)} label="Unique project participants" /><Stat icon={Leaf} value={statValue(summary?.sdgsCovered)} label="SDGs with verified impact" /></div>
		<div className="mb-6 flex flex-wrap gap-2">{["ALL", "ACTIVE", "COMPLETED", "ARCHIVED"].map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-full px-4 py-2 text-xs font-bold ${statusFilter === status ? "bg-[#0f5132] text-white" : "border border-[#d9e5dc] bg-white text-[#587064]"}`}>{status === "ALL" ? "All projects" : status.charAt(0) + status.slice(1).toLowerCase()}</button>)}</div>
		{loading ? <p className="text-sm text-[#68776f]">Loading projects…</p> : error ? null : visibleProjects.length ? <div className="grid gap-5 md:grid-cols-2">{visibleProjects.map((project) => <ProjectCard key={project.id} project={project} joined={Boolean(project.joined)} joining={workingId === project.id} isAuthenticated={isAuthenticated} onJoin={() => join(project.id)} />)}</div> : <div className="sustain-card p-8 text-center text-sm text-[#68776f]">No projects match this status.</div>}
		<div className="mt-8 rounded-2xl bg-[#0f5132] p-7 text-white"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 className="text-xl font-black">Have an idea for change?</h2><p className="mt-2 text-sm text-[#bdd5c5]">Build a project with other students and turn your idea into measurable impact.</p></div>{isAuthenticated ? <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">Start a Project<Plus size={16} /></button> : <Link href="/login?next=%2Fprojects" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">Sign in to start<Plus size={16} /></Link>}</div></div>
		{showCreate && <ProjectCreateModal initialSdgId={createSdgId} onClose={() => setShowCreate(false)} onCreated={(project) => setProjects((items) => [project, ...items])} />}
	</div></section>;
}

function Stat({ icon: Icon, value, label }: { icon: typeof FolderKanban; value: number | string; label: string }) { return <div className="sustain-card flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f5ea] text-[#0f5132]"><Icon size={20} /></div><div><div className="text-xl font-black text-[#173526] sm:text-2xl">{typeof value === "number" ? value.toLocaleString() : value}</div><div className="text-xs font-semibold text-[#7a8880]">{label}</div></div></div>; }
