"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, MessageSquare, Plus, Target, Trash2, UserPlus, Users } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import type { Project } from "../../../types";
import {
	addProjectDiscussion,
	addProjectMilestone,
	deleteProject,
	getApiError,
	getProject,
	joinProject,
	inviteProjectMember,
	removeProjectMember,
	updateProject,
	updateProjectMilestone,
} from "../../../services/platform.service";

export default function ProjectDetailPage() {
	const params = useParams<{ id: string }>();
	const { user, isAuthenticated } = useAuth();
	const [project, setProject] = useState<Project | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [working, setWorking] = useState(false);
	const [message, setMessage] = useState("");
	const [inviteEmail, setInviteEmail] = useState("");
	const [milestoneTitle, setMilestoneTitle] = useState("");
	const [editing, setEditing] = useState(false);
	const [edit, setEdit] = useState({ title: "", description: "", location: "", progress: 0, status: "ACTIVE" as "ACTIVE" | "COMPLETED" | "ARCHIVED" });

	async function refresh() {
		try {
			const data = await getProject(params.id);
			setProject(data);
			setEdit({ title: data.title, description: data.description, location: data.location ?? "", progress: data.progress ?? 0, status: (data.status as "ACTIVE" | "COMPLETED" | "ARCHIVED") ?? "ACTIVE" });
		} catch (e) {
			setError(getApiError(e, "Unable to load this project."));
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { void refresh(); }, [params.id]);

	const owner = Boolean(project?.ownerId && project.ownerId === user?.id);
	async function joinTeam() {
		if (!project) return;
		setWorking(true); setError("");
		try { await joinProject(project.id); await refresh(); }
		catch (e) { setError(getApiError(e, "Unable to join this project.")); }
		finally { setWorking(false); }
	}
	async function saveEdit(event: FormEvent) {
		event.preventDefault();
		if (!project) return;
		setWorking(true); setError("");
		try { await updateProject(project.id, edit); await refresh(); setEditing(false); } catch (e) { setError(getApiError(e, "Unable to update project.")); } finally { setWorking(false); }
	}
	async function removeProject() {
		if (!project || !window.confirm("Delete this project permanently?")) return;
		setWorking(true); setError("");
		try { await deleteProject(project.id); window.location.href = "/projects"; } catch (e) { setError(getApiError(e, "Unable to delete project.")); } finally { setWorking(false); }
	}
	async function invite(event: FormEvent) {
		event.preventDefault();
		if (!project) return;
		setWorking(true); setError("");
		try { await inviteProjectMember(project.id, inviteEmail); setInviteEmail(""); await refresh(); } catch (e) { setError(getApiError(e, "Unable to invite participant.")); } finally { setWorking(false); }
	}
	async function addDiscussion(event: FormEvent) {
		event.preventDefault();
		if (!project || !message.trim()) return;
		setWorking(true); setError("");
		try { await addProjectDiscussion(project.id, message.trim()); setMessage(""); await refresh(); } catch (e) { setError(getApiError(e, "Unable to post discussion.")); } finally { setWorking(false); }
	}
	async function addMilestone(event: FormEvent) {
		event.preventDefault();
		if (!project || !milestoneTitle.trim()) return;
		setWorking(true); setError("");
		try { await addProjectMilestone(project.id, milestoneTitle.trim()); setMilestoneTitle(""); await refresh(); } catch (e) { setError(getApiError(e, "Unable to add milestone.")); } finally { setWorking(false); }
	}

	if (loading) return <section className="section"><div className="page-container text-sm text-[#68776f]">Loading project…</div></section>;
	if (error && !project) return <section className="section"><div className="page-container"><p role="alert" className="sustain-card p-6 text-sm text-[#a52b36]">{error}</p><button onClick={() => window.location.reload()} className="btn-secondary mt-4">Try again</button><Link href="/projects" className="ml-3 text-sm font-bold text-[#0f5132]">Back to projects</Link></div></section>;
	if (!project) return <section className="section"><div className="page-container"><p className="sustain-card p-6 text-sm text-[#68776f]">Project not found.</p><Link href="/projects" className="mt-4 inline-block text-sm font-bold text-[#0f5132]">Back to projects</Link></div></section>;
	const sdgs = project.sdgNumbers?.length ? project.sdgNumbers : [project.sdgId];

	return <section className="section bg-[#f7faf7]"><div className="page-container">
		<Link href="/projects" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Back to projects</Link>
		{error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
		<div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
			<div className="space-y-6">
				<div className="sustain-card overflow-hidden">{project.imageUrl && <img src={project.imageUrl} alt={project.title} className="h-64 w-full object-cover" />}<div className="p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{sdgs.map((sdg) => <Link key={sdg} href={`/sdgs/${sdg}`} className="badge badge-green hover:underline">SDG {sdg}</Link>)}</div>{owner && <div className="flex gap-2"><button onClick={() => setEditing(!editing)} className="btn-secondary">Edit</button><button onClick={() => void removeProject()} disabled={working} className="inline-flex items-center gap-2 rounded-xl border border-[#edc4c7] px-4 py-2 text-sm font-bold text-[#a52b36]"><Trash2 size={15} />Delete</button></div>}</div><h1 className="mt-5 text-3xl font-black text-[#173526]">{project.title}</h1><p className="mt-4 text-sm leading-7 text-[#68776f]">{project.description}</p><div className="mt-5 flex flex-wrap items-center gap-3">{project.joined ? <span className="badge badge-green">Joined project team</span> : isAuthenticated ? <button type="button" onClick={() => void joinTeam()} disabled={working} className="btn-primary disabled:opacity-60">{working ? "Joining…" : "Join project team"}</button> : <Link href={`/login?next=${encodeURIComponent(`/projects/${project.id}`)}`} className="btn-primary">Sign in to join team</Link>}<Link href={`/sdgs/${project.sdgId}`} className="btn-secondary">Explore SDG {project.sdgId}</Link></div><div className="mt-6"><div className="mb-2 flex justify-between text-xs font-bold text-[#738178]"><span>Project progress</span><span>{project.progress ?? 0}%</span></div><div className="h-3 overflow-hidden rounded-full bg-[#e7eee9]"><div className="h-full rounded-full bg-[#4e9a52]" style={{ width: `${project.progress ?? 0}%` }} /></div></div></div></div>
				{editing && <form onSubmit={saveEdit} className="sustain-card space-y-4 p-6"><h2 className="font-extrabold text-[#173526]">Edit project</h2><input required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className="h-11 w-full rounded-xl border border-[#d9e5dc] px-3 text-sm" /><textarea required rows={4} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="w-full rounded-xl border border-[#d9e5dc] px-3 py-3 text-sm" /><div className="grid gap-3 sm:grid-cols-3"><input value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} placeholder="Location" className="h-11 rounded-xl border border-[#d9e5dc] px-3 text-sm" /><input type="number" min={0} max={100} value={edit.progress} onChange={(e) => setEdit({ ...edit, progress: Number(e.target.value) })} className="h-11 rounded-xl border border-[#d9e5dc] px-3 text-sm" /><select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as "ACTIVE" | "COMPLETED" | "ARCHIVED" })} className="h-11 rounded-xl border border-[#d9e5dc] px-3 text-sm"><option>ACTIVE</option><option>COMPLETED</option><option>ARCHIVED</option></select></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button><button disabled={working} className="btn-primary">{working ? "Saving…" : "Save changes"}</button></div></form>}
				<div className="sustain-card p-6"><div className="mb-5 flex items-center gap-2"><CheckCircle2 size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Milestones</h2></div>{owner && <form onSubmit={addMilestone} className="mb-4 flex gap-3"><input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} placeholder="Add a milestone" className="h-11 min-w-0 flex-1 rounded-xl border border-[#d9e5dc] px-3 text-sm" /><button className="btn-primary"><Plus size={16} />Add</button></form>}<div className="space-y-3">{project.milestones?.length ? project.milestones.map((milestone) => <div key={milestone.id} className="flex items-center justify-between rounded-xl border border-[#e1ebe4] p-4"><div><p className="text-sm font-bold text-[#405349]">{milestone.title}</p><p className="mt-1 text-xs text-[#87938d]">{milestone.status.replace("_", " ")}</p></div>{owner && <select value={milestone.status} onChange={(event) => void updateProjectMilestone(project.id, milestone.id, { status: event.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED" }).then(refresh)} className="rounded-lg border border-[#d9e5dc] px-2 py-2 text-xs"><option>PENDING</option><option>IN_PROGRESS</option><option>COMPLETED</option></select>}</div>) : <p className="text-sm text-[#87938d]">No milestones have been created.</p>}</div></div>
				<div className="sustain-card p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><MessageSquare size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Project discussions</h2></div>{project.joined && isAuthenticated && <Link href={`/chat?projectId=${encodeURIComponent(project.id)}`} className="btn-secondary text-sm"><MessageSquare size={15} />Open team chat</Link>}</div><div className="space-y-3">{project.discussions?.length ? project.discussions.map((item) => <div key={item.id} className="rounded-xl bg-[#f2f8f4] p-4"><p className="text-xs font-bold text-[#4f8060]">{item.authorName}</p><p className="mt-2 text-sm leading-6 text-[#405349]">{item.message}</p></div>) : <p className="text-sm text-[#87938d]">Start a project discussion.</p>}</div>{project.joined && isAuthenticated && <form onSubmit={addDiscussion} className="mt-4 flex gap-3"><input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} placeholder="Write a message..." className="h-11 min-w-0 flex-1 rounded-xl border border-[#d9e5dc] px-3 text-sm" /><button className="btn-primary">Post</button></form>}</div>
			</div>
			<div className="space-y-6">
				<div className="sustain-card p-6"><div className="flex items-center gap-2"><Users size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Team</h2></div><div className="mt-5 space-y-3">{project.team?.length ? project.team.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e1ebe4] p-3"><div><p className="text-sm font-bold text-[#405349]">{member.name}</p><p className="text-xs text-[#87938d]">{member.role}</p></div>{owner && member.id !== project.ownerId && <button onClick={() => void removeProjectMember(project.id, member.id).then(refresh)} className="text-xs font-bold text-[#a52b36]">Remove</button>}</div>) : <p className="text-sm text-[#87938d]">No team members.</p>}</div>{owner && <form onSubmit={invite} className="mt-5"><label className="mb-2 block text-xs font-bold text-[#738178]">Invite participant</label><div className="flex gap-2"><input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email address" className="h-11 min-w-0 flex-1 rounded-xl border border-[#d9e5dc] px-3 text-sm" /><button className="rounded-xl bg-[#0f5132] px-3 text-white"><UserPlus size={17} /></button></div></form>}</div>
				<div className="sustain-card p-6"><div className="flex items-center gap-2"><Target size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Project activities</h2></div><div className="mt-4 space-y-3">{project.activities?.length ? project.activities.map((activity) => <Link key={activity.id} href="/impact-map" className="block rounded-xl bg-[#f2f8f4] p-4"><p className="text-sm font-bold text-[#405349]">{activity.title}</p><p className="mt-1 text-xs text-[#87938d]">{activity.status} • SDG {activity.sdgId}</p></Link>) : <p className="text-sm text-[#87938d]">No linked activities yet.</p>}</div></div>
				<div className="sustain-card p-6"><div className="flex items-center gap-2"><CalendarDays size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Project status</h2></div><p className="mt-4 text-sm font-bold text-[#405349]">{project.status ?? "ACTIVE"}</p>{project.location && <p className="mt-2 text-xs text-[#87938d]">{project.location}</p>}</div>
			</div>
		</div>
	</div></section>;
}
