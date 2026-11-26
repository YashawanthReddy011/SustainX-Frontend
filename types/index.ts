export type Role = "STUDENT" | "COMMUNITY" | "ADMIN";

export type ActivityStatus =
	| "PENDING"
	| "VERIFIED"
	| "REJECTED"
	| "NEEDS_INFO";

export type ReportStatus =
	| "SUBMITTED"
	| "UNDER_REVIEW"
	| "INVESTIGATING"
	| "RESOLVED"
	| "REJECTED";

export interface User {
	id: string;
	name: string;
	email: string;
	role: Role;
	points?: number;
	impactPoints?: number;
	avatarUrl?: string;
}

export interface SDG {
	id: number;
	code: string;
	title: string;
	shortDescription: string;
	description?: string;
	color?: string;
	icon?: string;
	actions?: string[];
	targetCount?: number;
	category?: "People" | "Prosperity" | "Planet" | "Peace" | "Partnership";
	isActive?: boolean;
	progress?: number;
	completedActions?: number;
	totalActions?: number;
	relatedChallenges?: Challenge[];
	relatedProjects?: Project[];
	relatedActivities?: Activity[];
}

export interface SDGStats {
	totalGoals: number;
	totalPillars: number;
	totalTargets: number;
}

export interface Challenge {
	id: string;
	title: string;
	description: string;
	sdgId: number;
	sdgNumbers?: number[];
	points: number;
	deadline?: string;
	startDate?: string;
	endDate?: string;
	durationDays?: number;
	participants?: number;
	status?: string;
	computedStatus?: "ACTIVE" | "UPCOMING" | "COMPLETED" | "DRAFT" | "ARCHIVED";
	difficulty?: "Easy" | "Medium" | "Hard";
	instructions?: string[];
	requirements?: string[];
	requiredSubmissions?: number;
	joined?: boolean;
	myProgress?: {
		submitted: number;
		pending: number;
		verified: number;
		completionPercent: number;
		requiredSubmissions: number;
	};
}

export interface ChallengeListResponse {
	items: Challenge[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ChallengeStats {
	activeChallenges: number;
	upcomingChallenges: number;
	completedChallenges: number;
	participants: number;
	verifiedActions: number;
}

export interface Activity {
	id: string;
	title: string;
	description: string;
	sdgId: number;
	userId?: string;
	challengeId?: string;
	evidenceUrl?: string;
	status: ActivityStatus;
	points?: number;
	createdAt?: string;
	reviewedAt?: string;
	rejectionReason?: string;
	reviewNote?: string;
	location?: string;
	category?: string;
	quantity?: number;
	latitude?: number;
	longitude?: number;
	projectId?: string;
}

export type EnvironmentalActivityType =
	| "TREE_PLANTATION"
	| "TREE_SURVIVAL"
	| "WATER_CONSERVATION"
	| "RENEWABLE_ENERGY"
	| "WASTE_REDUCTION"
	| "CLIMATE_ACTION"
	| "MARINE_PROTECTION"
	| "BIODIVERSITY";

export interface EnvironmentalSubmission {
	id: string;
	type: EnvironmentalActivityType;
	title: string;
	description: string;
	location: string;
	activityDate?: string;
	quantity: number;
	unit: string;
	measurementMethod?: string;
	speciesName?: string;
	evidenceUrls: string[];
	beforeImageUrl?: string;
	afterImageUrl?: string;
	status: "PENDING" | "VERIFIED" | "REJECTED";
	reviewNote?: string | null;
	submittedAt: string;
	reviewedAt?: string;
}

export interface EnvironmentalSummary {
	totalActivities: number;
	verifiedActivities: number;
	pendingActivities: number;
	rejectedActivities: number;
	treePlantation: number;
	treeSurvival: number;
	waterSaved: number;
	renewableEnergy: number;
	wasteReduced: number;
	climateActions: number;
	marineActions: number;
	biodiversityObservations: number;
	environmentalSDGs: number[];
	totals: {
		trees: number;
		treeSurvival: number;
		litres: number;
		kwh: number;
		wasteKg: number;
		climateActions: number;
		marineActions: number;
		speciesObservations: number;
		verifiedSubmissions: number;
	};
	monthlyAnalytics: Array<{
		month: string;
		trees: number;
		treeSurvival: number;
		litres: number;
		kwh: number;
		wasteKg: number;
		climateActions: number;
		marineActions: number;
		speciesObservations: number;
		verifiedSubmissions: number;
	}>;
	sdgNumbers: number[];
}

export interface Project {
	id: string;
	message?: string;
	title: string;
	description: string;
	sdgId: number;
	ownerId?: string;
	ownerName?: string;
	imageUrl?: string;
	category?: "Environment" | "Education" | "Community" | "Health" | "Technology" | "Agriculture" | "Other";
	objectives?: string[];
	visibility?: "PUBLIC" | "PRIVATE";
	status?: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
	computedStatus?: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "ACTIVE" | "UPCOMING" | "COMPLETED" | "ARCHIVED";
	participantCount?: number;
	members?: number;
	progress?: number;
	location?: string;
	startDate?: string;
	endDate?: string;
	joined?: boolean;
	sdgNumbers?: number[];
	membershipStatus?: "NONE" | "PENDING" | "INVITED" | "APPROVED" | "REJECTED" | "REMOVED";
	milestones?: Array<{ id: string; title: string; description?: string; status: "PENDING" | "IN_PROGRESS" | "COMPLETED"; dueDate?: string; assignedTo?: string; completedAt?: string }>;
	discussions?: Array<{ id: string; authorName: string; message: string; createdAt: string }>;
	team?: Array<{ id: string; membershipId?: string; name: string; email?: string; role: "OWNER" | "LEADER" | "MEMBER"; status?: string }>;
	membershipRequests?: Array<{ id: string; membershipId: string; name: string; email: string; createdAt?: string }>;
	evidence?: ProjectEvidence[];
	activities?: Activity[];
}

export interface ProjectEvidence {
	id: string;
	projectId: string;
	milestoneId?: string | null;
	submittedBy: string;
	description: string;
	files: Array<{ url: string; publicId?: string; resourceType?: string }>;
	sdgNumbers: number[];
	status: "PENDING" | "APPROVED" | "REJECTED";
	reviewComment?: string;
	createdAt?: string;
	projectTitle?: string;
	submitterName?: string;
	submitterEmail?: string;
}

export interface ProjectListResponse {
	items: Project[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ProjectStats {
	publishedProjects: number;
	activeProjects: number;
	upcomingProjects: number;
	completedProjects: number;
	uniqueParticipants: number;
	verifiedSdgs: number;
}

export interface CommunityReport {
	id: string;
	title: string;
	description: string;
	category: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	sdgNumbers?: number[];
	status: ReportStatus;
	createdAt?: string;
	createdBy?: string;
	reviewNote?: string;
	imageUrls?: string[];
	resolutionDetails?: string;
	resolutionEvidenceUrl?: string;
	upvotes?: number;
	upvoted?: boolean;
	comments?: Array<{ id: string; userId: string; authorName: string; message: string; createdAt: string }>;
	statusHistory?: Array<{ status: ReportStatus; changedByName?: string; note: string; createdAt: string }>;
}

export interface CommunityReportListResponse {
	items: CommunityReport[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CommunityReportStats {
	total: number;
	submitted: number;
	underReview: number;
	investigating: number;
	resolved: number;
	rejected: number;
	resolutionRate: number;
}

export interface ChatMessage {
	id: string;
	conversationId?: string;
	content: string;
	createdAt: string;
	attachmentUrl?: string;
	attachmentType?: "IMAGE";
	readBy?: string[];
	author: {
		id: string;
		name: string;
		role: Role;
	};
}

export type ChatConversationKind = "DIRECT" | "GROUP" | "COMMUNITY" | "PROJECT" | "CHALLENGE";

export interface ChatConversation {
	id: string;
	type: ChatConversationKind;
	title: string;
	contextId?: string;
	createdAt: string;
	updatedAt?: string;
	lastActivityAt?: string;
	lastMessage?: ChatMessage | null;
	unreadCount: number;
	otherUserId?: string;
	members: Array<{ id: string; name: string; role: Role }>;
}

export interface ChatUser {
	id: string;
	name: string;
	email: string;
	role: Role;
}

export interface Certificate {
	id: string;
	certificateNumber: string;
	title: string;
	issuedAt: string;
	status: "ACTIVE" | "REVOKED";
	verificationUrl?: string;
	activityId?: string;
	userId?: string;
}

export interface ImpactStats {
	totalActivities: number;
	verifiedActivities: number;
	totalPoints: number;
	projects: number;
	trees: number;
	communityReports: number;
	sdgsImpacted: number;
}

export interface LeaderboardUser {
	id: string;
	name: string;
	points: number;
	activities: number;
	rank: number;
}

export interface DashboardData {
	user: User | null;
	stats: {
		totalActivities: number;
		verifiedActivities: number;
		totalPoints: number;
		projects: number;
		challenges: number;
		certificates: number;
		sdgsImpacted: number;
		environmentalSubmissions: number;
		reportsSubmitted: number;
		reportsResolved: number;
		discussionGroups: number;
	};
	activities: Activity[];
	notifications: Array<{ id: string; title: string; message: string; createdAt: string; read: boolean }>;
	activityGrowth: Array<{ month: string; activities: number }>;
	sdgImpact: Array<{ name: string; value: number }>;
	joinedChallenges: Array<{ id: string; title: string; status: string; points: number; participants: number }>;
	projectProgress: Array<{ id: string; title: string; status: string; progress: number; milestones: number; completedMilestones: number }>;
	environmentalImpact: {
		trees: number;
		litres: number;
		wasteKg: number;
		speciesObservations: number;
		verifiedSubmissions: number;
		monthly: Array<{ month: string; verifiedSubmissions: number }>;
	};
	communityAnalytics: {
		reportsByStatus: Array<{ status: string; count: number }>;
		monthlyReports: Array<{ month: string; reports: number }>;
		recentReports: Array<{ id: string; title: string; status: ReportStatus; createdAt: string }>;
	};
	leaderboard: {
		userRank: number;
		topUsers: Array<{ id: string; name: string; points: number; rank: number }>;
	};
}

export interface AdminDashboardData {
	stats: {
		users: number;
		activeUsers: number;
		totalActivities: number;
		pendingActivities: number;
		verifiedActivities: number;
		rejectedActivities: number;
		totalPoints: number;
		certificates: number;
		sdgsCovered: number;
		projects: number;
		participants: number;
		reports: number;
		pendingReports: number;
		reportsUnderReview: number;
		resolvedReports: number;
		environmentalSubmissions: number;
	};
	activityGrowth: Array<{ month: string; activities: number; verifiedActivities: number; users: number }>;
	sdgImpact: Array<{ name: string; value: number }>;
	projectStatuses: Array<{ status: string; count: number }>;
	reportStatuses: Array<{ status: string; count: number }>;
	environmentalImpact: { trees: number; litres: number; wasteKg: number; speciesObservations: number; verifiedSubmissions: number };
	recentAuditLogs: Array<{ id: string; actor: string; action: string; targetType: string; targetId: string; details: string; createdAt: string }>;
}
