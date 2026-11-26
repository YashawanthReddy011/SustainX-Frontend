"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, FileCheck2, ImagePlus, Leaf, MessageSquare, Plus, Target, Trash2, UserPlus, Users } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import type { Project } from "../../../types";
import { api } from "../../../lib/api";
import {
	addProjectDiscussion,
	addProjectMilestone,
	deleteProject,
	getApiError,
	getProject,
	joinProject,
	inviteProjectMember,
	removeProjectMember,
	submitProjectEvidence,
	updateProject,
	updateProjectMembership,
	updateProjectMilestone,
} from "../../../services/platform.service";

const categories = ["Environment", "Education", "Community", "Health", "Technology", "Agriculture", "Other"] as const;

export default function ProjectDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const { user, isAuthenticated } = useAuth();
	const [project, setProject] = useState<Project | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [working, setWorking] = useState(false);
	const [message, setMessage] = useState("");
	const [inviteEmail, setInviteEmail] = useState("");
	const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", dueDate: "" });
	const [discussion, setDiscussion] = useState("");
	const [evidenceForm, setEvidenceForm] = useState({ description: "", milestoneId: "", evidenceUrl: "" });
	const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
	const [editing, setEditing] = useState(false);
	const [edit, setEdit] = useState({ title: "", description: "", objectives: "", category: "Environment" as typeof categories[number], location: "", imageUrl: "", startDate: "", endDate: "", sdgNumbers: [] as number[] });

	async function refresh() {
		setError("");
		try {
			const data = await getProject(params.id);
			setProject(data);
			setEdit({ title: data.title, description: data.description, objectives: (data.objectives ?? []).join("\n"), category: data.category ?? "Other", location: data.location ?? "", imageUrl: data.imageUrl ?? "", startDate: toLocalInput(data.startDate), endDate: toLocalInput(data.endDate), sdgNumbers: data.sdgNumbers?.length ? data.sdgNumbers : [data.sdgId] });
		} catch (cause) { setError(getApiError(cause, "Unable to load this project.")); }
		finally { setLoading(false); }
	}

	useEffect(() => { let active = true; setLoading(true); void getProject(params.id).then((data) => { if (active) { setProject(data); setEdit({ title: data.title, description: data.description, objectives: (data.objectives ?? []).join("\n"), category: data.category ?? "Other", location: data.location ?? "", imageUrl: data.imageUrl ?? "", startDate: toLocalInput(data.startDate), endDate: toLocalInput(data.endDate), sdgNumbers: data.sdgNumbers?.length ? data.sdgNumbers : [data.sdgId] }); } }).catch((cause) => { if (active) setError(getApiError(cause, "Unable to load this project.")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [params.id]);

	const owner = Boolean(project?.ownerId && project.ownerId === user?.id);
	const isLeader = Boolean(project?.team?.some((member) => member.id === user?.id && member.role === "LEADER"));
	const manager = owner || isLeader;
	const joined = Boolean(project?.joined);
	const sdgs = project?.sdgNumbers?.length ? project.sdgNumbers : project ? [project.sdgId] : [];

	async function joinTeam() {
		if (!project) return;
		setWorking(true); setError("");
		try { const result = await joinProject(project.id); setMessage(result.message ?? "Your request was sent to the project owner."); await refresh(); }
		catch (cause) { setError(getApiError(cause, "Unable to request project membership.")); }
		finally { setWorking(false); }
	}

	async function saveEdit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault(); if (!project) return;
		setWorking(true); setError("");
		try {
			await updateProject(project.id, { title: edit.title.trim(), description: edit.description.trim(), objectives: edit.objectives.split(/\r?\n/).map((line) => line.trim()).filter(Boolean), category: edit.category, location: edit.location.trim(), imageUrl: edit.imageUrl.trim(), sdgNumbers: edit.sdgNumbers, startDate: new Date(edit.startDate).toISOString(), endDate: new Date(edit.endDate).toISOString() });
			await refresh(); setEditing(false); setMessage("Project details saved.");
		} catch (cause) { setError(getApiError(cause, "Unable to update project.")); }
		finally { setWorking(false); }
	}

	async function archive() {
		if (!project || !window.confirm("Archive this project? It will no longer appear in public discovery.")) return;
		setWorking(true); setError("");
		try { await deleteProject(project.id); router.push("/projects"); }
		catch (cause) { setError(getApiError(cause, "Unable to archive this project.")); }
		finally { setWorking(false); }
	}

	async function invite(event: FormEvent<HTMLFormElement>) {
		event.preventDefault(); if (!project) return;
		setWorking(true); setError("");
		try { await inviteProjectMember(project.id, inviteEmail); setInviteEmail(""); setMessage("Invitation sent. The member will appear after accepting."); await refresh(); }
		catch (cause) { setError(getApiError(cause, "Unable to invite participant.")); }
		finally { setWorking(false); }
	}

	async function updateMembership(memberId: string, status: "APPROVED" | "REJECTED" | "REMOVED", role?: "MEMBER" | "LEADER") {
		if (!project) return;
		setWorking(true); setError("");
		try { await updateProjectMembership(project.id, memberId, status, role); setMessage(status === "APPROVED" ? "Membership approved." : status === "REJECTED" ? "Request declined." : "Team membership updated."); await refresh(); }
		catch (cause) { setError(getApiError(cause, "Unable to update membership.")); }
		finally { setWorking(false); }
	}

	async function createMilestone(event: FormEvent<HTMLFormElement>) {
		event.preventDefault(); if (!project) return;
		setWorking(true); setError("");
		try { await addProjectMilestone(project.id, { title: milestoneForm.title.trim(), description: milestoneForm.description.trim(), ...(milestoneForm.dueDate ? { dueDate: new Date(milestoneForm.dueDate).toISOString() } : {}) }); setMilestoneForm({ title: "", description: "", dueDate: "" }); await refresh(); }
		catch (cause) { setError(getApiError(cause, "Unable to add the milestone.")); }
		finally { setWorking(false); }
	}

	async function setMilestoneStatus(milestoneId: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
		if (!project) return;
		setWorking(true); setError("");
		try { await updateProjectMilestone(project.id, milestoneId, { status }); await refresh(); }
		catch (cause) { setError(getApiError(cause, "Unable to update the milestone.")); }
		finally { setWorking(false); }
	}

	async function addDiscussion(event: FormEvent<HTMLFormElement>) {
		event.preventDefault(); if (!project || !discussion.trim()) return;
		setWorking(true); setError("");
		try { await addProjectDiscussion(project.id, discussion.trim()); setDiscussion(""); await refresh(); }
		catch (cause) { setError(getApiError(cause, "Unable to post the discussion.")); }
		finally { setWorking(false); }
	}

	async function submitEvidence(event: FormEvent<HTMLFormElement>) {
		event.preventDefault(); if (!project) return;
		setWorking(true); setError("");
		try {
			let evidenceUrl = evidenceForm.evidenceUrl.trim();
			if (evidenceFile) { const body = new FormData(); body.append("file", evidenceFile); const upload = await api.post("/media", body, { headers: { "Content-Type": "multipart/form-data" } }); evidenceUrl = upload.data.media.url; }
			if (!evidenceUrl) throw new Error("Attach a photo or evidence link.");
			await submitProjectEvidence(project.id, { description: evidenceForm.description.trim(), ...(evidenceForm.milestoneId ? { milestoneId: evidenceForm.milestoneId } : {}), evidenceUrls: [evidenceUrl] });
			setEvidenceForm({ description: "", milestoneId: "", evidenceUrl: "" }); setEvidenceFile(null); setMessage("Evidence submitted for admin verification."); await refresh();
		} catch (cause) { setError(getApiError(cause, "Unable to submit project evidence.")); }
		finally { setWorking(false); }
	}

	if (loading) return <section className="section"><div className="page-container text-sm text-[#68776f]" role="status">Loading project...</div></section>;
	if (error && !project) return <section className="section"><div className="page-container"><p role="alert" className="sustain-card p-6 text-sm text-[#a52b36]">{error}</p><button onClick={() => { setLoading(true); void refresh(); }} className="btn-secondary mt-4">Try again</button><Link href="/projects" className="ml-3 text-sm font-bold text-[#0f5132]">Back to projects</Link></div></section>;
	if (!project) return <section className="section"><div className="page-container"><p className="sustain-card p-6 text-sm text-[#68776f]">Project not found.</p><Link href="/projects" className="mt-4 inline-block text-sm font-bold text-[#0f5132]">Back to projects</Link></div></section>;

	return <section className="section bg-[#f7faf7]"><div className="page-container max-w-6xl">
		<Link href="/projects" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#0f5132]"><ArrowLeft size={16} />Back to projects</Link>
		{error && <p role="alert" className="mb-4 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}</p>}
		{message && <p role="status" className="mb-4 rounded-xl bg-[#e8f5eb] p-3 text-sm text-[#28643a]">{message}</p>}
		<div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
			<div className="space-y-6">
				<header className="sustain-card overflow-hidden">{project.imageUrl && <img src={project.imageUrl} alt={project.title} className="h-64 w-full object-cover" />}<div className="p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex flex-wrap gap-2">{sdgs.map((sdg) => <Link key={sdg} href={`/sdgs/${sdg}`} className="badge badge-green hover:underline">SDG {sdg}</Link>)}{project.category && <span className="badge">{project.category}</span>}</div>{owner && <div className="flex gap-2"><button type="button" onClick={() => setEditing((value) => !value)} className="btn-secondary">Edit details</button><button type="button" onClick={() => void archive()} disabled={working} className="inline-flex items-center gap-2 rounded-xl border border-[#edc4c7] px-4 py-2 text-sm font-bold text-[#a52b36]"><Trash2 size={15} />Archive</button></div>}</div><span className="mt-5 inline-flex rounded-full bg-[#edf6ef] px-3 py-1 text-xs font-bold capitalize text-[#28643a]">{(project.computedStatus ?? project.status ?? "PENDING").toLowerCase()}</span><h1 className="mt-3 text-3xl font-black text-[#173526]">{project.title}</h1><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#68776f]">{project.description}</p><div className="mt-5 flex flex-wrap gap-3">{joined ? <span className="badge badge-green">{owner ? "Project owner" : project.membershipStatus === "APPROVED" ? "Approved team member" : "Project team"}</span> : project.membershipStatus === "INVITED" && project.computedStatus === "ACTIVE" ? <button type="button" onClick={() => void joinTeam()} disabled={working} className="btn-primary disabled:opacity-60">{working ? "Accepting..." : "Accept invitation"}</button> : project.membershipStatus === "PENDING" ? <span className="rounded-full bg-[#fff5df] px-3 py-1.5 text-xs font-bold text-[#8b641d]">Membership request pending</span> : isAuthenticated && project.computedStatus === "ACTIVE" && project.membershipStatus !== "INVITED" ? <button type="button" onClick={() => void joinTeam()} disabled={working} className="btn-primary disabled:opacity-60">{working ? "Requesting..." : "Request to join"}</button> : !isAuthenticated && project.computedStatus === "ACTIVE" ? <Link href={`/login?next=${encodeURIComponent(`/projects/${project.id}`)}`} className="btn-primary">Sign in to request membership</Link> : null}<Link href={`/challenges?sdg=${project.sdgId}`} className="btn-secondary">Explore related challenges</Link></div><div className="mt-6"><div className="mb-2 flex justify-between text-xs font-bold text-[#738178]"><span>Milestone progress</span><span>{project.progress ?? 0}%</span></div><div className="h-3 overflow-hidden rounded-full bg-[#e7eee9]"><div className="h-full rounded-full bg-[#4e9a52]" style={{ width: `${project.progress ?? 0}%` }} /></div></div></div></header>

				{editing && <form onSubmit={saveEdit} className="sustain-card space-y-4 p-6"><h2 className="font-extrabold text-[#173526]">Edit project details</h2><Field label="Project name"><input required minLength={3} maxLength={150} value={edit.title} onChange={(event) => setEdit({ ...edit, title: event.target.value })} className={inputClass} /></Field><Field label="Description"><textarea required rows={4} value={edit.description} onChange={(event) => setEdit({ ...edit, description: event.target.value })} className={`${inputClass} h-auto py-3`} /></Field><Field label="Objectives (one per line)"><textarea rows={3} value={edit.objectives} onChange={(event) => setEdit({ ...edit, objectives: event.target.value })} className={`${inputClass} h-auto py-3`} /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Category"><select value={edit.category} onChange={(event) => setEdit({ ...edit, category: event.target.value as typeof categories[number] })} className={inputClass}>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Location"><input value={edit.location} onChange={(event) => setEdit({ ...edit, location: event.target.value })} className={inputClass} /></Field></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Start date"><input required type="datetime-local" value={edit.startDate} onChange={(event) => setEdit({ ...edit, startDate: event.target.value })} className={inputClass} /></Field><Field label="End date"><input required type="datetime-local" value={edit.endDate} onChange={(event) => setEdit({ ...edit, endDate: event.target.value })} className={inputClass} /></Field></div><Field label="Cover image URL"><input type="url" value={edit.imageUrl} onChange={(event) => setEdit({ ...edit, imageUrl: event.target.value })} className={inputClass} /></Field><fieldset><legend className="mb-2 text-sm font-bold text-[#405349]">Associated SDGs</legend><div className="grid grid-cols-4 gap-2 sm:grid-cols-6">{Array.from({ length: 17 }, (_, index) => index + 1).map((number) => <label key={number} className="flex items-center gap-1.5 rounded-lg border border-[#d9e5dc] px-2 py-1.5 text-xs"><input type="checkbox" checked={edit.sdgNumbers.includes(number)} onChange={() => setEdit((current) => ({ ...current, sdgNumbers: current.sdgNumbers.includes(number) ? current.sdgNumbers.filter((value) => value !== number) : [...current.sdgNumbers, number].sort((a, b) => a - b) }))} className="accent-[#0f5132]" />{number}</label>)}</div></fieldset><div className="flex justify-end gap-3"><button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button><button disabled={working} className="btn-primary">{working ? "Saving..." : "Save details"}</button></div></form>}

				<section className="sustain-card p-6"><div className="mb-5 flex items-center gap-2"><Target size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Project objectives</h2></div>{project.objectives?.length ? <ul className="space-y-3">{project.objectives.map((objective, index) => <li key={`${index}-${objective}`} className="flex gap-3 text-sm leading-6 text-[#52645a]"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#4e9a52]" />{objective}</li>)}</ul> : <p className="text-sm text-[#87938d]">The project team has not added objectives yet.</p>}</section>

				<section className="sustain-card p-6"><div className="mb-5 flex items-center gap-2"><CheckCircle2 size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Milestones</h2></div>{manager && <form onSubmit={createMilestone} className="mb-5 grid gap-3 rounded-xl bg-[#f6faf7] p-4"><Field label="Milestone title"><input required minLength={3} value={milestoneForm.title} onChange={(event) => setMilestoneForm({ ...milestoneForm, title: event.target.value })} className={inputClass} placeholder="e.g. Prepare the planting area" /></Field><Field label="Description"><input value={milestoneForm.description} onChange={(event) => setMilestoneForm({ ...milestoneForm, description: event.target.value })} className={inputClass} /></Field><Field label="Deadline"><input type="date" value={milestoneForm.dueDate} onChange={(event) => setMilestoneForm({ ...milestoneForm, dueDate: event.target.value })} className={inputClass} /></Field><button disabled={working} className="btn-primary justify-self-start"><Plus size={16} />Add milestone</button></form>}<div className="space-y-3">{project.milestones?.length ? project.milestones.map((milestone) => <div key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e1ebe4] p-4"><div><p className="text-sm font-bold text-[#405349]">{milestone.title}</p>{milestone.description && <p className="mt-1 text-xs text-[#738178]">{milestone.description}</p>}<p className="mt-1 text-xs text-[#87938d]">{milestone.dueDate ? `Due ${formatDate(milestone.dueDate)}` : "No deadline"}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-[#edf6ef] px-2.5 py-1 text-[11px] font-bold text-[#28643a]">{milestone.status.replace("_", " ").toLowerCase()}</span>{manager && <select aria-label={`Update ${milestone.title} status`} value={milestone.status} disabled={working} onChange={(event) => void setMilestoneStatus(milestone.id, event.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED")} className="rounded-lg border border-[#d9e5dc] px-2 py-2 text-xs"><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select>}</div></div>) : <p className="text-sm text-[#87938d]">No milestones have been added yet. Project progress remains 0% until milestones are completed.</p>}</div></section>

				<section className="sustain-card p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><MessageSquare size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Team discussion</h2></div>{joined && isAuthenticated && <Link href={`/chat?projectId=${encodeURIComponent(project.id)}`} className="btn-secondary text-sm"><MessageSquare size={15} />Open team chat</Link>}</div>{joined ? <><div className="space-y-3">{project.discussions?.length ? project.discussions.map((item) => <div key={item.id} className="rounded-xl bg-[#f2f8f4] p-4"><p className="text-xs font-bold text-[#4f8060]">{item.authorName} · {formatDate(item.createdAt)}</p><p className="mt-2 text-sm leading-6 text-[#405349]">{item.message}</p></div>) : <p className="text-sm text-[#87938d]">No discussion messages yet.</p>}</div><form onSubmit={addDiscussion} className="mt-4 flex gap-3"><input value={discussion} onChange={(event) => setDiscussion(event.target.value)} maxLength={2000} placeholder="Share an update with the team..." className="h-11 min-w-0 flex-1 rounded-xl border border-[#d9e5dc] px-3 text-sm" /><button disabled={working || !discussion.trim()} className="btn-primary">Post</button></form></> : <p className="text-sm text-[#87938d]">Join the approved project team to read and post in its private discussion.</p>}</section>
			</div>

			<aside className="space-y-6">
				<section className="sustain-card p-6"><div className="flex items-center gap-2"><Users size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Project team</h2></div><p className="mt-2 text-xs text-[#77847d]">{project.participantCount ?? project.team?.length ?? 0} approved members</p><div className="mt-4 space-y-3">{project.team?.map((member) => <div key={member.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#e1ebe4] p-3"><div><p className="text-sm font-bold text-[#405349]">{member.name}{member.id === project.ownerId ? " (Owner)" : ""}</p><p className="text-xs text-[#87938d]">{member.role.toLowerCase()}</p></div>{manager && member.id !== project.ownerId && <div className="flex gap-2"><select aria-label={`Role for ${member.name}`} disabled={!owner || working} value={member.role === "LEADER" ? "LEADER" : "MEMBER"} onChange={(event) => void updateMembership(member.id, "APPROVED", event.target.value as "MEMBER" | "LEADER")} className="rounded-lg border border-[#d9e5dc] px-2 py-1 text-xs"><option value="MEMBER">Member</option><option value="LEADER">Leader</option></select><button type="button" onClick={() => void updateMembership(member.id, "REMOVED")} disabled={working} className="text-xs font-bold text-[#a52b36]">Remove</button></div>}</div>)}</div>
					{manager && project.membershipRequests?.length ? <div className="mt-5 border-t border-[#e7eee9] pt-4"><h3 className="mb-3 text-sm font-extrabold text-[#405349]">Membership requests</h3>{project.membershipRequests.map((request) => <div key={request.id} className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-[#f6faf7] p-3"><div><p className="text-sm font-bold">{request.name}</p><p className="text-xs text-[#87938d]">{request.email}</p></div><div className="flex gap-2"><button type="button" onClick={() => void updateMembership(request.id, "APPROVED")} disabled={working} className="rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-bold text-white">Approve</button><button type="button" onClick={() => void updateMembership(request.id, "REJECTED")} disabled={working} className="rounded-lg border border-[#edc4c7] px-3 py-2 text-xs font-bold text-[#a52b36]">Decline</button></div></div>)}</div> : null}
					{manager && <form onSubmit={invite} className="mt-5 border-t border-[#e7eee9] pt-4"><label className="mb-2 block text-xs font-bold text-[#738178]">Invite a SustainX member</label><div className="flex gap-2"><input type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="Email address" className="h-11 min-w-0 flex-1 rounded-xl border border-[#d9e5dc] px-3 text-sm" /><button disabled={working} aria-label="Send invitation" className="rounded-xl bg-[#0f5132] px-3 text-white"><UserPlus size={17} /></button></div></form>}
				</section>

				{joined && <section className="sustain-card p-6"><div className="mb-4 flex items-center gap-2"><FileCheck2 size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Project evidence</h2></div><form onSubmit={submitEvidence} className="space-y-3"><Field label="What progress did you make?"><textarea required minLength={10} maxLength={2000} rows={3} value={evidenceForm.description} onChange={(event) => setEvidenceForm({ ...evidenceForm, description: event.target.value })} className={`${inputClass} h-auto py-3`} /></Field><Field label="Related milestone (optional)"><select value={evidenceForm.milestoneId} onChange={(event) => setEvidenceForm({ ...evidenceForm, milestoneId: event.target.value })} className={inputClass}><option value="">General project evidence</option>{project.milestones?.map((milestone) => <option value={milestone.id} key={milestone.id}>{milestone.title}</option>)}</select></Field><Field label="Evidence image URL (optional if uploaded)"><input type="url" value={evidenceForm.evidenceUrl} onChange={(event) => setEvidenceForm({ ...evidenceForm, evidenceUrl: event.target.value })} className={inputClass} placeholder="https://..." /></Field><label className="flex items-center gap-2 text-xs font-bold text-[#405349]"><ImagePlus size={15} />Upload evidence photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)} className="block min-w-0 text-xs" /></label><button disabled={working} className="btn-primary w-full justify-center">{working ? "Submitting..." : "Submit for verification"}</button></form><div className="mt-5 space-y-3">{project.evidence?.map((item) => <div key={item.id} className="rounded-xl bg-[#f6faf7] p-3"><div className="flex justify-between gap-2"><p className="text-xs font-bold text-[#405349]">{item.status.toLowerCase()}</p><time className="text-[11px] text-[#87938d]">{item.createdAt ? formatDate(item.createdAt) : ""}</time></div><p className="mt-2 text-sm text-[#52645a]">{item.description}</p>{item.files?.map((file) => <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-[#0f5132] underline">View evidence</a>)}{item.reviewComment && <p className="mt-2 text-xs text-[#68776f]">Review: {item.reviewComment}</p>}</div>)}</div></section>}

				<section className="sustain-card p-6"><div className="flex items-center gap-2"><CalendarDays size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Project overview</h2></div><div className="mt-5 space-y-4"><Detail label="Owner" value={project.ownerName ?? "SustainX member"} /><Detail label="Category" value={project.category ?? "Other"} /><Detail label="Starts" value={formatDate(project.startDate)} /><Detail label="Ends" value={formatDate(project.endDate)} /><Detail label="Location" value={project.location || "Not specified"} /><Detail label="Visibility" value={project.visibility ?? "PUBLIC"} /></div><div className="mt-5 flex flex-wrap gap-2">{sdgs.map((sdg) => <Link key={sdg} href={`/sdgs/${sdg}`} className="rounded-full bg-[#edf6ef] px-3 py-1.5 text-xs font-bold text-[#316143] hover:underline">Explore SDG {sdg}</Link>)}</div></section>

				{project.activities?.length ? <section className="sustain-card p-6"><div className="mb-4 flex items-center gap-2"><Leaf size={20} className="text-[#0f5132]" /><h2 className="font-extrabold text-[#173526]">Verified project impact</h2></div><div className="space-y-3">{project.activities.map((activity) => <Link key={activity.id} href="/impact-map" className="block rounded-xl bg-[#f2f8f4] p-4"><p className="text-sm font-bold text-[#405349]">{activity.title}</p><p className="mt-1 text-xs text-[#87938d]">Verified · SDG {activity.sdgId}</p></Link>)}</div></section> : null}
			</aside>
		</div>
	</div></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-[#405349]"><span className="mb-2 block">{label}</span>{children}</label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 border-b border-[#edf1ee] pb-3 last:border-0 last:pb-0"><span className="text-xs text-[#849087]">{label}</span><span className="text-right text-sm font-bold text-[#405349]">{value}</span></div>; }
function formatDate(value?: string) { if (!value) return "Not set"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString(undefined, { dateStyle: "medium" }); }
function toLocalInput(value?: string) { if (!value) return ""; const date = new Date(value); if (Number.isNaN(date.getTime())) return ""; return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16); }
const inputClass = "h-11 w-full rounded-xl border border-[#d9e5dc] bg-white px-3 text-sm outline-none focus:border-[#78ad84]";
