import api from "../lib/api";
import type { Activity, Certificate, Challenge, CommunityReport, DashboardData, Project } from "../types";

export async function getChallenges() {
	const { data } = await api.get<Challenge[]>("/challenges");
	return data;
}

export async function joinChallenge(id: string) {
	const { data } = await api.post(`/challenges/${encodeURIComponent(id)}/join`);
	return data;
}

export async function getProjects() {
	const { data } = await api.get<Project[]>("/projects");
	return data;
}

export async function createProject(input: Pick<Project, "title" | "description" | "sdgId"> & { location?: string }) {
	const { data } = await api.post<Project>("/projects", input);
	return data;
}

export async function joinProject(id: string) {
	const { data } = await api.post(`/projects/${encodeURIComponent(id)}/join`);
	return data;
}

export async function getReports() {
	const { data } = await api.get<CommunityReport[]>("/reports");
	return data;
}

export async function createReport(input: Pick<CommunityReport, "title" | "description" | "category" | "location">) {
	const { data } = await api.post<CommunityReport>("/reports", input);
	return data;
}

export async function updateReportStatus(id: string, status: "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED", reviewNote?: string) {
	const { data } = await api.patch<CommunityReport>(`/reports/${encodeURIComponent(id)}/status`, { status, reviewNote });
	return data;
}

export async function getMyActivities() {
	const { data } = await api.get<Activity[]>("/activities/mine");
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
	const { data } = await api.post<Activity>("/activities", input);
	return data;
}

export async function getDashboard() {
	const { data } = await api.get<DashboardData>("/dashboard/me");
	return data;
}

export async function getMyCertificates() {
	const { data } = await api.get<Certificate[]>("/certificates/mine");
	return data;
}

export async function getCertificateVerification(id: string) {
	const { data } = await api.get(`/certificates/verify/${encodeURIComponent(id)}`);
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
	const { data } = await api.get<{ sdgs: number; challenges: number; projects: number; verifiedActivities: number; locations: number; modules: number }>("/summary");
	return data;
}
