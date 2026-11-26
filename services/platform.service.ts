import api from "../lib/api";
import type { Activity, AdminDashboardData, Certificate, Challenge, ChallengeListResponse, ChallengeStats, ChatConversation, ChatMessage, ChatUser, CommunityReport, CommunityReportListResponse, CommunityReportStats, DashboardData, EnvironmentalSubmission, EnvironmentalSummary, Project, ProjectEvidence, ProjectListResponse, ProjectStats, Role } from "../types";

export async function getChallenges(filters?: { status?: string; sdg?: number; sdgId?: number; search?: string; difficulty?: string; sort?: string; page?: number; limit?: number; mine?: boolean; signal?: AbortSignal }) {
	const { data } = await api.get<ChallengeListResponse | Challenge[]>("/challenges", { params: { ...filters, signal: undefined, ...(filters?.mine ? { mine: "1" } : {}) }, signal: filters?.signal });
	if (Array.isArray(data)) return { items: data, pagination: { page: 1, limit: data.length, total: data.length, totalPages: 1 } };
	return data;
}

export async function getChallengeStats() {
	const { data } = await api.get<ChallengeStats>("/challenges/stats");
	return data;
}

export async function getChallenge(id: string) {
	const { data } = await api.get<Challenge>(`/challenges/${encodeURIComponent(id)}`);
	return data;
}

export async function joinChallenge(id: string) {
	const { data } = await api.post<{ id: string; joined: boolean; participants: number }>(`/challenges/${encodeURIComponent(id)}/join`);
	return data;
}

export async function withdrawFromChallenge(id: string) {
	const { data } = await api.post<{ id: string; joined: boolean; withdrawn: boolean }>(`/challenges/${encodeURIComponent(id)}/withdraw`);
	return data;
}

export async function getProjects(filters?: { status?: string; sdg?: number; sdgId?: number; search?: string; category?: string; sort?: string; page?: number; limit?: number; mine?: boolean; signal?: AbortSignal }) {
	const { data } = await api.get<ProjectListResponse | Project[]>("/projects", { params: { ...filters, signal: undefined, ...(filters?.mine ? { mine: "1" } : {}) }, signal: filters?.signal });
	if (Array.isArray(data)) return { items: data, pagination: { page: 1, limit: data.length, total: data.length, totalPages: data.length ? 1 : 0 } };
	return data;
}

export async function getProjectStats() {
	const { data } = await api.get<ProjectStats>("/projects/stats");
	return data;
}

export type CreateProjectInput = Pick<Project, "title" | "description" | "sdgNumbers" | "category" | "objectives" | "location" | "imageUrl" | "startDate" | "endDate" | "visibility">;

export async function createProject(input: CreateProjectInput) {
	const { data } = await api.post<Project>("/projects", input);
	return data;
}

export async function joinProject(id: string) {
	const { data } = await api.post<{ id: string; status: "PENDING" | "APPROVED"; message: string }>(`/projects/${encodeURIComponent(id)}/join`);
	return data;
}

export async function getProject(id: string) {
	const { data } = await api.get<Project>(`/projects/${encodeURIComponent(id)}`);
	return data;
}

export async function getProjectMembers(id: string) {
	const { data } = await api.get<Array<{ id: string; name: string; role: Role }>>(`/projects/${encodeURIComponent(id)}/members`);
	return data;
}

export async function updateProject(id: string, input: Partial<Pick<Project, "title" | "description" | "objectives" | "category" | "location" | "imageUrl" | "startDate" | "endDate" | "visibility" | "sdgNumbers">>) {
	const { data } = await api.patch<Project>(`/projects/${encodeURIComponent(id)}`, input);
	return data;
}

export async function updateProjectMembership(id: string, memberId: string, status: "APPROVED" | "REJECTED" | "REMOVED", role?: "MEMBER" | "LEADER") {
	const { data } = await api.patch(`/projects/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`, { status, ...(role ? { role } : {}) });
	return data;
}

export async function deleteProject(id: string) {
	await api.delete(`/projects/${encodeURIComponent(id)}`);
}

export async function inviteProjectMember(id: string, email: string) {
	const { data } = await api.post(`/projects/${encodeURIComponent(id)}/invite`, { email });
	return data;
}

export async function removeProjectMember(id: string, memberId: string) {
	const { data } = await api.delete(`/projects/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`);
	return data;
}

export async function addProjectMilestone(id: string, input: { title: string; description?: string; dueDate?: string; assignedTo?: string }) {
	const { data } = await api.post(`/projects/${encodeURIComponent(id)}/milestones`, input);
	return data;
}

export async function updateProjectMilestone(id: string, milestoneId: string, input: { title?: string; status?: "PENDING" | "IN_PROGRESS" | "COMPLETED"; dueDate?: string }) {
	const { data } = await api.patch(`/projects/${encodeURIComponent(id)}/milestones/${encodeURIComponent(milestoneId)}`, input);
	return data;
}

export async function addProjectDiscussion(id: string, message: string) {
	const { data } = await api.post(`/projects/${encodeURIComponent(id)}/discussions`, { message });
	return data;
}

export async function submitProjectEvidence(id: string, input: { description: string; milestoneId?: string; evidenceUrls: string[] }) {
	const { data } = await api.post<ProjectEvidence>(`/projects/${encodeURIComponent(id)}/evidence`, input);
	return data;
}

export async function getReports(filters?: { status?: string; category?: string; search?: string; from?: string; to?: string; page?: number; limit?: number }) {
	const { data } = await api.get<CommunityReportListResponse>("/community/reports", { params: filters });
	return data;
}

export async function getMyReports(filters?: { status?: string; page?: number; limit?: number }) {
	const { data } = await api.get<CommunityReportListResponse>("/community/reports/mine", { params: filters });
	return data;
}

export async function getCommunityReportStats() {
	const { data } = await api.get<CommunityReportStats>("/community/reports/stats");
	return data;
}

export async function getCommunityReport(id: string) {
	const { data } = await api.get<CommunityReport>(`/community/reports/${encodeURIComponent(id)}`);
	return data;
}

export async function createReport(input: Pick<CommunityReport, "title" | "description" | "category" | "location"> & Partial<Pick<CommunityReport, "latitude" | "longitude" | "imageUrls" | "sdgNumbers">>) {
	const { data } = await api.post<CommunityReport>("/community/reports", input);
	return data;
}

export async function updateReportStatus(id: string, status: "UNDER_REVIEW" | "INVESTIGATING" | "RESOLVED" | "REJECTED", reviewNote?: string, resolutionDetails?: string, resolutionEvidenceUrl?: string) {
	const { data } = await api.patch<CommunityReport>(`/community/reports/${encodeURIComponent(id)}/status`, { status, reviewNote, resolutionDetails, resolutionEvidenceUrl });
	return data;
}

export async function addReportComment(id: string, message: string) {
	const { data } = await api.post(`/community/reports/${encodeURIComponent(id)}/comments`, { message });
	return data;
}

export async function toggleReportUpvote(id: string) {
	const { data } = await api.post<{ upvotes: number; upvoted: boolean }>(`/community/reports/${encodeURIComponent(id)}/upvote`);
	return data;
}

export async function getMyActivities() {
	const { data } = await api.get<Activity[]>("/submissions");
	return data;
}

export async function getSubmission(id: string) {
	const { data } = await api.get<Activity>(`/submissions/${encodeURIComponent(id)}`);
	return data;
}

export async function getVerifiedActivities() {
	const { data } = await api.get<Activity[]>("/activities", { params: { status: "VERIFIED" } });
	return data;
}

export async function createActivity(input: {
	title: string;
	description: string;
	location: string;
	evidenceUrl?: string;
	quantity: number;
	sdgId: number;
	challengeId?: string;
	category?: string;
	latitude?: number;
	longitude?: number;
}) {
	const { data } = await api.post<Activity>("/submissions", input);
	return data;
}

export async function getDashboard(role?: Role) {
	const path = role === "STUDENT" ? "/dashboard/student" : role === "COMMUNITY" ? "/dashboard/community" : "/dashboard/me";
	const { data } = await api.get<DashboardData>(path);
	return data;
}

export async function getAdminDashboard() {
	const { data } = await api.get<AdminDashboardData>("/dashboard/admin");
	return data;
}

export async function getMyCertificates() {
	const { data } = await api.get<Certificate[]>("/certificates");
	return data;
}

export async function getCertificateVerification(id: string) {
	const { data } = await api.get(`/certificates/${encodeURIComponent(id)}`);
	return data;
}

export function getApiError(error: unknown, fallback: string) {
	if (typeof error === "object" && error !== null && "response" in error) {
		const response = (error as { response?: { data?: { error?: unknown; message?: string } } }).response;
		const serverError = response?.data?.error;
		if (typeof serverError === "string") return serverError;
		if (typeof response?.data?.message === "string") return response.data.message;
	}
	return fallback;
}

export async function getPublicSummary() {
	const { data } = await api.get<{
		sdgs: number;
		challenges: number;
		projects: number;
		verifiedActivities: number;
		sdgsCovered: number;
		activeChallenges: number;
		verifiedActions: number;
		impactProjects: number;
		resolvedIssues: number;
		participants: number;
		impactPoints: number;
		locations: number;
		modules: number;
		recentActivities: Activity[];
		recentProjects: Project[];
		topSdgs: Array<{ number: number; count: number }>;
		monthlyImpact: Array<{ month: string; activities: number }>;
		leaderboard: Array<{ id: string; name: string; points: number; rank: number }>;
	}>("/home/stats");
	return data;
}

export async function getHomeRecentActivities(params?: { sdgId?: number; search?: string; page?: number; limit?: number }) {
	const { data } = await api.get<Activity[]>("/home/recent-activities", { params });
	return data;
}

export async function getChatConversations() {
	const { data } = await api.get<ChatConversation[]>("/chat/conversations");
	return data;
}

export async function getNotifications(filters?: { read?: boolean; page?: number; limit?: number }) {
	const { data } = await api.get<Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>>("/notifications", { params: filters });
	return data;
}

export async function markNotificationsRead(ids?: string[]) {
	const { data } = await api.post<{ updated: number }>("/notifications/read", { ids });
	return data;
}

export async function getChatMessages(conversationId: string, cursor?: string) {
	const { data } = await api.get<{ messages: ChatMessage[]; nextCursor: string | null; hasMore: boolean }>("/chat/messages", { params: { conversationId, ...(cursor ? { cursor } : {}), limit: 30 } });
	return data;
}

export async function markChatConversationRead(conversationId: string, messageId: string) {
	await api.post(`/chat/conversations/${encodeURIComponent(conversationId)}/read`, { messageId });
}

export async function searchChatMessages(conversationId: string, query: string) {
	const { data } = await api.get<ChatMessage[]>(`/chat/conversations/${encodeURIComponent(conversationId)}/messages/search`, { params: { q: query } });
	return data;
}

export async function startDirectChat(userId: string) {
	const { data } = await api.post<ChatConversation>("/chat/direct", { userId });
	return data;
}

export async function startGroupChat(title: string, memberEmails: string[]) {
	const { data } = await api.post<ChatConversation>("/chat/groups", { title, memberEmails });
	return data;
}

export async function openCommunityChat() {
	const { data } = await api.post<ChatConversation>("/chat/community/open");
	return data;
}

export async function openProjectChat(projectId: string) {
	const { data } = await api.post<ChatConversation>(`/chat/projects/${encodeURIComponent(projectId)}/open`);
	return data;
}

export async function openChallengeChat(challengeId: string) {
	const { data } = await api.post<ChatConversation>(`/chat/challenges/${encodeURIComponent(challengeId)}/open`);
	return data;
}

export async function getChatUsers(query: string) {
	const { data } = await api.get<ChatUser[]>("/chat/users", { params: { q: query } });
	return data;
}

export async function reportChatMessage(messageId: string, reason: string) {
	const { data } = await api.post(`/chat/messages/${encodeURIComponent(messageId)}/report`, { reason });
	return data;
}

export async function blockChatUser(userId: string) {
	const { data } = await api.post(`/chat/users/${encodeURIComponent(userId)}/block`);
	return data;
}

export async function unblockChatUser(userId: string) {
	await api.delete(`/chat/users/${encodeURIComponent(userId)}/block`);
}

export async function getBlockedChatUsers() {
	const { data } = await api.get<Array<{ id: string; name: string; email: string; blockedAt: string }>>("/chat/blocks");
	return data;
}

export async function getUnreadChatCount() {
	const { data } = await api.get<{ count: number }>("/chat/notifications/unread-count");
	return data.count;
}

export async function getEnvironmentalSummary() {
	const { data } = await api.get<EnvironmentalSummary>("/ecoguard/stats");
	return data;
}

export async function getEnvironmentalActivities(filters?: { type?: EnvironmentalSubmission["type"]; page?: number; limit?: number }) {
	const { data } = await api.get<Array<Record<string, unknown>>>("/ecoguard/activities", { params: filters });
	return data;
}

export async function getImpactAnalytics() {
	const { data } = await api.get<{ verifiedActions: number; activeChallenges: number; impactProjects: number; monthlyVerifiedActions: Array<{ month: string; verifiedActions: number }> }>("/analytics/impact");
	return data;
}

export async function getSdgAnalytics() {
	const { data } = await api.get<Array<{ sdgId: number; title: string; verifiedActions: number }>>("/analytics/sdgs");
	return data;
}

export async function getMyEnvironmentalSubmissions() {
	const { data } = await api.get<EnvironmentalSubmission[]>("/ecoguard/submissions");
	return data;
}

export async function submitEnvironmentalActivity(input: {
	idempotencyKey: string;
	type: EnvironmentalSubmission["type"];
	title: string;
	description: string;
	location: string;
	activityDate: string;
	quantity: number;
	measurementMethod?: string;
	speciesName?: string;
	evidenceUrls: string[];
	beforeImageUrl?: string;
	afterImageUrl?: string;
}) {
	const { data } = await api.post<EnvironmentalSubmission>("/ecoguard/submissions", input);
	return data;
}
