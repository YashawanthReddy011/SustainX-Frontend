export type Role = "STUDENT" | "COMMUNITY" | "ADMIN";

export type ActivityStatus =
	| "PENDING"
	| "VERIFIED"
	| "REJECTED"
	| "NEEDS_INFO";

export type ReportStatus =
	| "REPORTED"
	| "UNDER_REVIEW"
	| "IN_PROGRESS"
	| "RESOLVED";

export interface User {
	id: string;
	name: string;
	email: string;
	role: Role;
	points?: number;
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
}

export interface Challenge {
	id: string;
	title: string;
	description: string;
	sdgId: number;
	points: number;
	deadline?: string;
	participants?: number;
	status?: string;
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
}

export interface Project {
	id: string;
	title: string;
	description: string;
	sdgId: number;
	ownerId?: string;
	imageUrl?: string;
	status?: string;
	members?: number;
	progress?: number;
}

export interface CommunityReport {
	id: string;
	title: string;
	description: string;
	category: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	status: ReportStatus;
	createdAt?: string;
}

export interface Certificate {
	id: string;
	certificateNumber: string;
	title: string;
	issuedAt: string;
	status: "ACTIVE" | "REVOKED";
	verificationUrl?: string;
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
