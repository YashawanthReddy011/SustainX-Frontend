"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, Ban, Check, FileImage, Flag, MessageCircle, Plus, Search, Send, Users, X } from "lucide-react";
import type { ChatConversation, ChatMessage, ChatUser } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import api from "../../lib/api";
import { getChatSocket } from "../../lib/chat-socket";
import { blockChatUser, getApiError, getBlockedChatUsers, getChatConversations, getChatMessages, getChatUsers, markChatConversationRead, openChallengeChat, openCommunityChat, openProjectChat, reportChatMessage, searchChatMessages, startDirectChat, startGroupChat, unblockChatUser } from "../../services/platform.service";

type BlockedUser = { id: string; name: string; email: string; blockedAt: string };

export default function ChatWorkspace() {
	const { user, loading: authLoading, isAuthenticated } = useAuth();
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [activeId, setActiveId] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [searchResults, setSearchResults] = useState<ChatMessage[] | null>(null);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(false);
	const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
	const [error, setError] = useState("");
	const [loadingList, setLoadingList] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [sending, setSending] = useState(false);
	const [draft, setDraft] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [messageQuery, setMessageQuery] = useState("");
	const [showNew, setShowNew] = useState(false);
	const [newMode, setNewMode] = useState<"DIRECT" | "GROUP">("DIRECT");
	const [userQuery, setUserQuery] = useState("");
	const [userResults, setUserResults] = useState<ChatUser[]>([]);
	const [groupTitle, setGroupTitle] = useState("");
	const [groupEmails, setGroupEmails] = useState("");
	const [showBlocked, setShowBlocked] = useState(false);
	const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
	const [showMembers, setShowMembers] = useState(false);
	const tailRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLInputElement>(null);
	const lastLoadedMessageId = useRef<string | null>(null);
	const joinedConversationId = useRef("");

	const reloadConversations = useCallback(async () => {
		const list = await getChatConversations();
		setConversations(list);
		return list;
	}, []);

	useEffect(() => {
		if (authLoading || !isAuthenticated) { setLoadingList(false); return; }
		let cancelled = false;
		(async () => {
			setLoadingList(true); setError("");
			try {
				const params = new URLSearchParams(window.location.search);
				let targetId = params.get("conversationId") || "";
				if (params.has("community")) targetId = (await openCommunityChat()).id;
				else if (params.get("projectId")) targetId = (await openProjectChat(params.get("projectId")!)).id;
				else if (params.get("challengeId")) targetId = (await openChallengeChat(params.get("challengeId")!)).id;
				const list = await reloadConversations();
				if (cancelled) return;
				setActiveId(targetId || list[0]?.id || "");
			} catch (e) { if (!cancelled) setError(getApiError(e, "Unable to load conversations.")); }
			finally { if (!cancelled) setLoadingList(false); }
		})();
		return () => { cancelled = true; };
	}, [authLoading, isAuthenticated, reloadConversations]);

	useEffect(() => {
		if (!isAuthenticated) return;
		const socket = getChatSocket();
		if (!socket) return;
		const onPresenceList = (event: { userIds?: string[] }) => setOnlineUsers(new Set(event.userIds ?? []));
		const onPresence = (event: { userId: string; online: boolean }) => setOnlineUsers((current) => {
			const next = new Set(current); if (event.online) next.add(event.userId); else next.delete(event.userId); return next;
		});
		const onMessage = (message: ChatMessage) => {
			setConversations((current) => current.map((item) => item.id === message.conversationId ? { ...item, lastMessage: message, lastActivityAt: message.createdAt, unreadCount: item.id === activeId ? 0 : item.unreadCount + (message.author.id === user?.id ? 0 : 1) } : item));
			if (message.conversationId === activeId) {
				setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
				lastLoadedMessageId.current = message.id;
				if (message.author.id !== user?.id && socket.connected) {
					socket.emit("conversation:read", { conversationId: activeId, messageId: message.id });
					void markChatConversationRead(activeId, message.id).then(() => window.dispatchEvent(new Event("sustainx:chat-read"))).catch(() => undefined);
				}
			}
		};
		const onRead = (receipt: { conversationId: string; userId: string; messageId: string }) => {
			if (receipt.conversationId !== activeId) return;
			setMessages((current) => current.map((item) => item.id === receipt.messageId ? { ...item, readBy: [...new Set([...(item.readBy ?? []), receipt.userId])] } : item));
		};
		socket.on("presence:list", onPresenceList);
		socket.on("presence:update", onPresence);
		socket.on("message:new", onMessage);
		socket.on("conversation:read", onRead);
		return () => { socket.off("presence:list", onPresenceList); socket.off("presence:update", onPresence); socket.off("message:new", onMessage); socket.off("conversation:read", onRead); };
	}, [activeId, isAuthenticated, user?.id]);

	useEffect(() => {
		if (!activeId || !isAuthenticated) { setMessages([]); return; }
		let cancelled = false;
		setMessages([]); setSearchResults(null); setLoadingMessages(true); setError(""); lastLoadedMessageId.current = null; joinedConversationId.current = "";
		const socket = getChatSocket();
		const load = async () => {
			try {
				const page = await getChatMessages(activeId);
				if (cancelled) return;
				setMessages(page.messages); setNextCursor(page.nextCursor); setHasMore(page.hasMore);
				const last = page.messages[page.messages.length - 1];
				if (last) {
					lastLoadedMessageId.current = last.id;
					await markChatConversationRead(activeId, last.id);
					window.dispatchEvent(new Event("sustainx:chat-read"));
					if (joinedConversationId.current === activeId && socket?.connected) socket.emit("conversation:read", { conversationId: activeId, messageId: last.id });
				}
				setConversations((current) => current.map((item) => item.id === activeId ? { ...item, unreadCount: 0 } : item));
			} catch (e) { if (!cancelled) setError(getApiError(e, "Unable to load this conversation.")); }
			finally { if (!cancelled) setLoadingMessages(false); }
		};
		const join = () => socket?.emit("conversation:join", { conversationId: activeId }, (result: { ok?: boolean; error?: string }) => {
			if (!result?.ok) setError(result?.error || "Unable to join this conversation.");
			else {
				joinedConversationId.current = activeId;
				if (lastLoadedMessageId.current) socket?.emit("conversation:read", { conversationId: activeId, messageId: lastLoadedMessageId.current });
			}
		});
		void load();
		if (socket?.connected) join(); else socket?.once("connect", join);
		return () => { cancelled = true; if (joinedConversationId.current === activeId) joinedConversationId.current = ""; socket?.off("connect", join); if (socket?.connected) socket.emit("conversation:leave", { conversationId: activeId }); };
	}, [activeId, isAuthenticated]);

	useEffect(() => { tailRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length]);

	useEffect(() => {
		if (!showNew || newMode !== "DIRECT" || userQuery.trim().length < 2) { setUserResults([]); return; }
		let cancelled = false;
		const timer = window.setTimeout(() => getChatUsers(userQuery.trim()).then((rows) => { if (!cancelled) setUserResults(rows); }).catch(() => { if (!cancelled) setUserResults([]); }), 250);
		return () => { cancelled = true; window.clearTimeout(timer); };
	}, [showNew, newMode, userQuery]);

	const active = conversations.find((item) => item.id === activeId) ?? null;
	const visibleMessages = searchResults ?? messages;
	const title = (conversation: ChatConversation) => conversation.title || conversation.members.find((item) => item.id !== user?.id)?.name || "Direct chat";
	const otherUserId = active?.type === "DIRECT" ? active.otherUserId ?? active.members.find((item) => item.id !== user?.id)?.id : undefined;

	async function loadOlder() {
		if (!activeId || !nextCursor || loadingMessages) return;
		setLoadingMessages(true);
		try {
			const page = await getChatMessages(activeId, nextCursor);
			setMessages((current) => [...page.messages, ...current]); setNextCursor(page.nextCursor); setHasMore(page.hasMore);
		} catch (e) { setError(getApiError(e, "Unable to load older messages.")); }
		finally { setLoadingMessages(false); }
	}

	async function submitMessage(event?: FormEvent) {
		event?.preventDefault();
		const content = draft.trim();
		if ((!content && !image) || !activeId || sending) return;
		const socket = getChatSocket();
		if (!socket?.connected) { setError("Chat is disconnected. Wait for it to reconnect."); return; }
		setSending(true); setError("");
		try {
			let attachmentUrl: string | undefined;
			if (image) {
				const form = new FormData(); form.append("file", image);
				const uploaded = await api.post("/media", form, { headers: { "Content-Type": "multipart/form-data" } });
				attachmentUrl = uploaded.data.media.url;
			}
			await new Promise<void>((resolve, reject) => {
				socket.timeout(12_000).emit("message:send", { conversationId: activeId, content, ...(attachmentUrl ? { attachmentUrl } : {}) }, (timeout: Error | null, result: { ok?: boolean; error?: string; message?: ChatMessage }) => {
					if (timeout) return reject(timeout);
					if (!result?.ok || !result.message) return reject(new Error(result?.error || "Unable to send this message."));
					setMessages((current) => current.some((item) => item.id === result.message!.id) ? current : [...current, result.message!]);
					setConversations((current) => current.map((item) => item.id === activeId ? { ...item, lastMessage: result.message!, lastActivityAt: result.message!.createdAt, unreadCount: 0 } : item));
					resolve();
				});
			});
			setDraft(""); setImage(null); if (imageRef.current) imageRef.current.value = "";
		} catch (e) { setError(getApiError(e, e instanceof Error ? e.message : "Unable to send this message.")); }
		finally { setSending(false); }
	}

	async function searchMessages(event: FormEvent) {
		event.preventDefault();
		if (!activeId || messageQuery.trim().length < 2) { setSearchResults(null); return; }
		try { setSearchResults(await searchChatMessages(activeId, messageQuery.trim())); }
		catch (e) { setError(getApiError(e, "Unable to search this conversation.")); }
	}

	async function openDirectChat(person: ChatUser) {
		try { const conversation = await startDirectChat(person.id); await reloadConversations(); setActiveId(conversation.id); setShowNew(false); setUserQuery(""); }
		catch (e) { setError(getApiError(e, "Unable to start a conversation.")); }
	}

	async function openCommunityRoom() {
		try {
			const conversation = await openCommunityChat();
			await reloadConversations();
			setActiveId(conversation.id);
		} catch (e) { setError(getApiError(e, "Unable to open the community conversation.")); }
	}

	async function createGroup(event: FormEvent) {
		event.preventDefault();
		const emails = groupEmails.split(/[;,\n]/).map((item) => item.trim()).filter(Boolean);
		try { const conversation = await startGroupChat(groupTitle, emails); await reloadConversations(); setActiveId(conversation.id); setShowNew(false); setGroupTitle(""); setGroupEmails(""); }
		catch (e) { setError(getApiError(e, "Unable to create this group.")); }
	}

	async function reportMessage(message: ChatMessage) {
		const reason = window.prompt("Why are you reporting this message? (at least 5 characters)")?.trim();
		if (!reason) return;
		try { await reportChatMessage(message.id, reason); setError("Message report sent to moderators."); }
		catch (e) { setError(getApiError(e, "Unable to report this message.")); }
	}

	async function blockOtherUser() {
		if (!otherUserId || !window.confirm("Block this person? Their messages will be hidden and direct messaging will stop.")) return;
		try { await blockChatUser(otherUserId); setActiveId(""); setMessages([]); setError("User blocked."); await reloadConversations(); }
		catch (e) { setError(getApiError(e, "Unable to block this user.")); }
	}

	async function toggleBlockedUsers() {
		if (!showBlocked) {
			try { setBlockedUsers(await getBlockedChatUsers()); }
			catch (e) { setError(getApiError(e, "Unable to load blocked users.")); }
		}
		setShowBlocked((value) => !value);
	}

	async function unblock(personId: string) {
		try { await unblockChatUser(personId); setBlockedUsers((current) => current.filter((item) => item.id !== personId)); await reloadConversations(); }
		catch (e) { setError(getApiError(e, "Unable to unblock this user.")); }
	}

	function onComposerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submitMessage(); }
	}

	if (authLoading) return <section className="section bg-[#f7faf7]"><div className="page-container text-sm text-[#68776f]">Checking your account…</div></section>;
	if (!isAuthenticated) return <section className="section bg-[#f7faf7]"><div className="page-container"><div className="sustain-card mx-auto max-w-xl p-8 text-center"><MessageCircle size={34} className="mx-auto text-[#0f5132]" /><h1 className="mt-4 text-2xl font-black text-[#173526]">Community Chat</h1><p className="mt-3 text-sm text-[#68776f]">Sign in to message SustainX members and join project discussions.</p><Link href="/login?next=%2Fchat" className="btn-primary mt-6">Sign in to chat</Link></div></div></section>;

	return <section className="min-h-[calc(100vh-72px)] bg-[#f5f8f6] py-6"><div className="page-container"><div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><Link href="/community" className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-[#0f5132]"><ArrowLeft size={14} />Community</Link><h1 className="text-3xl font-black text-[#173526]">Community Chat</h1><p className="mt-1 text-sm text-[#728078]">Direct messages, groups and project discussions.</p></div><div className="flex items-center gap-2"><button onClick={() => void openCommunityRoom()} className="btn-secondary text-sm"><MessageCircle size={15} />Community room</button><button onClick={() => void toggleBlockedUsers()} className="btn-secondary text-sm"><Ban size={15} />Blocked users</button></div></div>
		{error && <p role="status" className="mb-4 rounded-xl bg-[#fff0f1] p-3 text-sm text-[#a52b36]">{error}<button onClick={() => setError("")} className="ml-3 font-bold underline">Dismiss</button></p>}
		{showBlocked && <div className="mb-4 rounded-2xl border border-[#dce7df] bg-white p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-[#173526]">Blocked users</h2><button onClick={() => setShowBlocked(false)} aria-label="Close blocked users"><X size={18} /></button></div>{blockedUsers.length ? <div className="space-y-2">{blockedUsers.map((person) => <div key={person.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f6f9f6] p-3"><div><p className="text-sm font-bold text-[#405349]">{person.name}</p><p className="text-xs text-[#87938c]">{person.email}</p></div><button onClick={() => void unblock(person.id)} className="text-xs font-bold text-[#0f5132]">Unblock</button></div>)}</div> : <p className="text-sm text-[#87938c]">You have not blocked anyone.</p>}</div>}
		<div className="grid min-h-[70vh] overflow-hidden rounded-2xl border border-[#dce7df] bg-white shadow-sm lg:grid-cols-[320px_minmax(0,1fr)]">
			<aside className="flex min-h-[420px] flex-col border-b border-[#e4ece6] lg:border-b-0 lg:border-r"><div className="flex items-center justify-between border-b border-[#e4ece6] p-4"><h2 className="font-extrabold text-[#173526]">Conversations</h2><button onClick={() => setShowNew(true)} className="rounded-lg bg-[#eaf5ed] p-2 text-[#0f5132]" aria-label="New chat"><Plus size={18} /></button></div>{loadingList ? <p className="p-4 text-sm text-[#87938c]">Loading…</p> : <div className="flex-1 overflow-y-auto">{conversations.map((conversation) => <button key={conversation.id} onClick={() => setActiveId(conversation.id)} className={`w-full border-b border-[#eef2ef] px-4 py-3 text-left hover:bg-[#f6faf7] ${activeId === conversation.id ? "bg-[#eef7f0]" : ""}`}><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold text-[#30483b]">{title(conversation)}</span>{conversation.unreadCount > 0 && <span className="rounded-full bg-[#0f5132] px-2 py-0.5 text-[10px] font-bold text-white">{conversation.unreadCount}</span>}</div><p className="mt-1 truncate text-xs text-[#829087]">{conversation.lastMessage?.content || (conversation.lastMessage?.attachmentUrl ? "Image" : conversation.type.toLowerCase())}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-[#9aa69f]">{conversation.type}</p></button>)}{conversations.length === 0 && <p className="p-5 text-sm leading-6 text-[#87938c]">No conversations yet. Start a direct message or join the community chat.</p>}</div>}</aside>
			<main className="flex min-h-[420px] min-w-0 flex-col">{active ? <><header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4ece6] p-4"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate font-extrabold text-[#173526]">{title(active)}</h2>{active.type === "DIRECT" && otherUserId && <span className={`h-2.5 w-2.5 rounded-full ${onlineUsers.has(otherUserId) ? "bg-[#4caa5a]" : "bg-[#b5beb8]"}`} title={onlineUsers.has(otherUserId) ? "Online" : "Offline"} />}</div><p className="mt-1 text-xs text-[#849087]">{active.members.length} members · {active.type.toLowerCase()}</p></div><div className="flex items-center gap-2"><form onSubmit={searchMessages} className="flex items-center gap-1"><input value={messageQuery} onChange={(e) => setMessageQuery(e.target.value)} placeholder="Search messages" className="h-9 w-36 rounded-lg border border-[#d9e5dc] px-2 text-xs sm:w-48" /><button className="rounded-lg bg-[#eef7f0] p-2 text-[#0f5132]" aria-label="Search chat"><Search size={15} /></button></form>{otherUserId && <button onClick={() => void blockOtherUser()} className="rounded-lg border border-[#e1ebe4] p-2 text-[#68776f]" title="Block user"><Ban size={16} /></button>}<button onClick={() => setShowMembers((value) => !value)} className="rounded-lg border border-[#e1ebe4] p-2 text-[#68776f]" title="Conversation members"><Users size={16} /></button></div></header>
				{searchResults && <div className="flex items-center justify-between border-b border-[#e4ece6] bg-[#f7faf7] px-4 py-2 text-xs"><span>{searchResults.length} search result{searchResults.length === 1 ? "" : "s"}</span><button onClick={() => { setSearchResults(null); setMessageQuery(""); }} className="font-bold text-[#0f5132]">Clear</button></div>}
				<div className="flex flex-1 overflow-hidden"><div className="flex min-w-0 flex-1 flex-col"><div className="flex-1 space-y-4 overflow-y-auto bg-[#fbfdfb] p-4 sm:p-6">{hasMore && !searchResults && <button onClick={() => void loadOlder()} disabled={loadingMessages} className="mx-auto flex items-center gap-1 rounded-lg border border-[#dce7df] bg-white px-3 py-2 text-xs font-bold text-[#506357]"><ArrowDown size={13} />Load older messages</button>}{loadingMessages && messages.length === 0 ? <p className="py-8 text-center text-sm text-[#87938c]">Loading messages…</p> : visibleMessages.length ? visibleMessages.map((message) => { const own = message.author.id === user?.id; const read = own && (message.readBy ?? []).some((id) => id !== user?.id); return <div key={message.id} className={`group flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${own ? "bg-[#0f5132] text-white" : "border border-[#dce7df] bg-white text-[#173526]"}`}><div className="flex items-center gap-2"><p className={`text-[11px] font-bold ${own ? "text-[#b8d6c1]" : "text-[#4f8060]"}`}>{message.author.name}</p>{!own && <button onClick={() => void reportMessage(message)} title="Report message" className="opacity-0 transition group-hover:opacity-100"><Flag size={13} /></button>}</div>{message.content && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>}{message.attachmentUrl && <a href={message.attachmentUrl} target="_blank" rel="noreferrer"><img src={message.attachmentUrl} alt="Shared chat image" className="mt-2 max-h-64 rounded-xl object-cover" /></a>}<div className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${own ? "text-[#c3dcc9]" : "text-[#929e96]"}`}><span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>{own && (read ? <><Check size={12} /><span>Read</span></> : <span>Sent</span>)}</div></div></div>; }) : <div className="py-14 text-center"><MessageCircle size={30} className="mx-auto text-[#9bb2a1]" /><p className="mt-3 text-sm text-[#87938c]">No messages yet. Start the conversation.</p></div>}<div ref={tailRef} /></div>
					<form onSubmit={submitMessage} className="border-t border-[#e4ece6] bg-white p-3 sm:p-4"><div className="flex items-end gap-2"><button type="button" onClick={() => imageRef.current?.click()} className="rounded-xl border border-[#dce7df] p-3 text-[#52655a]" title="Attach image"><FileImage size={17} /></button><input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} /><textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onComposerKey} maxLength={1000} rows={1} placeholder="Type a message…" className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-[#d8e4dc] px-3 py-3 text-sm outline-none focus:border-[#74a980]" /> <button disabled={sending || (!draft.trim() && !image)} className="rounded-xl bg-[#0f5132] p-3 text-white disabled:opacity-50" aria-label="Send message">{sending ? <span className="block h-[17px] w-[17px] animate-pulse">…</span> : <Send size={17} />}</button></div>{image && <div className="mt-2 flex items-center justify-between rounded-lg bg-[#f1f8f3] px-3 py-2 text-xs text-[#52655a]"><span className="truncate">{image.name} · {(image.size / 1024 / 1024).toFixed(1)} MB</span><button type="button" onClick={() => { setImage(null); if (imageRef.current) imageRef.current.value = ""; }} aria-label="Remove image"><X size={15} /></button></div>}<p className="mt-2 text-[10px] text-[#9aa69f]">Enter to send · Shift+Enter for a new line · Images up to 5 MB</p></form></div>
					{showMembers && <aside className="w-56 border-l border-[#e4ece6] bg-white p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-[#30483b]">Members</h3><button onClick={() => setShowMembers(false)} aria-label="Close member list"><X size={16} /></button></div><div className="space-y-3">{active.members.map((member) => <div key={member.id} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${onlineUsers.has(member.id) ? "bg-[#4caa5a]" : "bg-[#bdc6c0]"}`} /><div><p className="text-xs font-bold text-[#405349]">{member.name}{member.id === user?.id ? " (you)" : ""}</p><p className="text-[10px] text-[#87938c]">{member.role}</p></div></div>)}</div></aside>}</div>
			</> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageCircle size={34} className="text-[#9bb2a1]" /><h2 className="mt-4 text-xl font-black text-[#173526]">Choose a conversation</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#87938c]">Select a conversation or start a new direct message or group chat.</p><button onClick={() => setShowNew(true)} className="btn-primary mt-5"><Plus size={16} />New conversation</button></div>}</main>
			</div>
		{showNew && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#082f1e]/60 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-[#173526]">New conversation</h2><button onClick={() => setShowNew(false)} aria-label="Close"><X size={19} /></button></div><div className="mt-5 flex gap-2"><button onClick={() => setNewMode("DIRECT")} className={`rounded-lg px-3 py-2 text-sm font-bold ${newMode === "DIRECT" ? "bg-[#0f5132] text-white" : "bg-[#eef4ef] text-[#53635a]"}`}>Direct message</button><button onClick={() => setNewMode("GROUP")} className={`rounded-lg px-3 py-2 text-sm font-bold ${newMode === "GROUP" ? "bg-[#0f5132] text-white" : "bg-[#eef4ef] text-[#53635a]"}`}>Group chat</button></div>{newMode === "DIRECT" ? <div className="mt-4"><input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Find a member by name or email" className="h-11 w-full rounded-xl border border-[#d9e5dc] px-3 text-sm" /><div className="mt-3 max-h-64 space-y-1 overflow-y-auto">{userResults.map((person) => <button key={person.id} onClick={() => void openDirectChat(person)} className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-[#f2f8f4]"><div><p className="text-sm font-bold text-[#405349]">{person.name}</p><p className="text-xs text-[#87938c]">{person.email}</p></div><span className="text-[10px] font-bold text-[#718078]">{person.role}</span></button>)}{userQuery.length >= 2 && userResults.length === 0 && <p className="p-3 text-sm text-[#87938c]">No available members found.</p>}</div></div> : <form onSubmit={createGroup} className="mt-4 space-y-3"><label className="block text-xs font-bold text-[#66746c]">Group name<input required minLength={2} maxLength={100} value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d9e5dc] px-3 text-sm" /></label><label className="block text-xs font-bold text-[#66746c]">Member emails, separated by commas<textarea value={groupEmails} onChange={(e) => setGroupEmails(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-[#d9e5dc] px-3 py-3 text-sm" placeholder="member@example.com, teammate@example.com" /></label><p className="text-xs text-[#87938c]">Invite verified SustainX accounts. You’ll be added automatically.</p><button className="btn-primary w-full justify-center"><Users size={16} />Create group</button></form>}</div></div>}
	</div></section>;
}
