"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Users, Leaf } from "lucide-react";
import ProjectCard from "../../components/project-card";
import ProjectCreateModal from "../../components/forms/ProjectCreateModal";
import { getApiError, getProjects, joinProject } from "../../services/platform.service";
import { useAuth } from "../../hooks/useAuth";
import type { Project } from "../../types";

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showCreate, setShowCreate] = useState(false); const [workingId, setWorkingId] = useState("");
	const { isAuthenticated } = useAuth();
	useEffect(() => { getProjects().then(setProjects).catch((e) => setError(getApiError(e, "Unable to load projects. Check that the API is running."))).finally(() => setLoading(false)); }, []);
	const sdgCount = useMemo(() => new Set(projects.map((project) => project.sdgId)).size, [projects]);
	async function join(id: string) { setWorkingId(id); setError(""); try { await joinProject(id); setProjects((items) => items.map((project) => project.id === id ? { ...project, joined: true, members: (project.members ?? 0) + 1 } : project)); } catch (e) { setError(getApiError(e, "Unable to join the project. Please sign in and try again.")); } finally { setWorkingId(""); } }
	return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="section-label"><FolderKanban size={14} />COLLABORATE</div><h1 className="mt-4 text-4xl font-black text-[#153426] md:text-5xl">Impact Projects</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#68776f]">Discover projects created by students and communities around practical sustainability goals.</p></div>{isAuthenticated ? <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={17} />Create Project</button> : <Link href="/login?next=%2Fprojects" className="btn-primary"><Plus size={17} />Sign in to create</Link>}</div>
		{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
		<div className="mb-8 grid gap-4 sm:grid-cols-3"><Stat icon={FolderKanban} value={projects.length} label="Active Projects" /><Stat icon={Users} value={projects.reduce((sum, item) => sum + (item.members ?? 0), 0)} label="Participants" /><Stat icon={Leaf} value={sdgCount} label="SDGs Covered" /></div>
		{loading ? <p className="text-sm text-[#68776f]">Loading projects…</p> : projects.length ? <div className="grid gap-5 md:grid-cols-2">{projects.map((project) => <ProjectCard key={project.id} project={project} joined={Boolean(project.joined)} joining={workingId === project.id} isAuthenticated={isAuthenticated} onJoin={() => join(project.id)} />)}</div> : <div className="sustain-card p-8 text-center text-sm text-[#68776f]">No projects yet. Create the first community project.</div>}
		<div className="mt-8 rounded-2xl bg-[#0f5132] p-7 text-white"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 className="text-xl font-black">Have an idea for change?</h2><p className="mt-2 text-sm text-[#bdd5c5]">Build a project with other students and turn your idea into measurable impact.</p></div>{isAuthenticated ? <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">Start a Project<Plus size={16} /></button> : <Link href="/login?next=%2Fprojects" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f5132]">Sign in to start<Plus size={16} /></Link>}</div></div>
		{showCreate && <ProjectCreateModal onClose={() => setShowCreate(false)} onCreated={(project) => setProjects((items) => [project, ...items])} />}
	</div></section>;
}

function Stat({ icon: Icon, value, label }: { icon: typeof FolderKanban; value: number; label: string }) { return <div className="sustain-card flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f5ea] text-[#0f5132]"><Icon size={20} /></div><div><div className="text-2xl font-black text-[#173526]">{value.toLocaleString()}</div><div className="text-xs font-semibold text-[#7a8880]">{label}</div></div></div>; }
