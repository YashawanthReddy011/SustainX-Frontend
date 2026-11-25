"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../types";
import api from "../lib/api";
import { disconnectChatSocket } from "../lib/chat-socket";

interface AuthState {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const refresh = useCallback(async () => {
		const token = localStorage.getItem("sustainx_token");
		if (!token) {
			setUser(null);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const { data } = await api.get<User>("/auth/me");
			setUser(data);
			localStorage.setItem("sustainx_user", JSON.stringify(data));
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { void refresh(); }, [refresh]);

	useEffect(() => {
		const handleAuthExpired = () => {
			setUser(null);
			setLoading(false);
		};
		const handleAuthChanged = () => { void refresh(); };
		const handleStorage = (event: StorageEvent) => {
			if (event.key !== "sustainx_token") return;
			if (event.newValue) handleAuthChanged();
			else handleAuthExpired();
		};
		window.addEventListener("sustainx:auth-expired", handleAuthExpired);
		window.addEventListener("sustainx:auth-changed", handleAuthChanged);
		window.addEventListener("storage", handleStorage);
		return () => {
			window.removeEventListener("sustainx:auth-expired", handleAuthExpired);
			window.removeEventListener("sustainx:auth-changed", handleAuthChanged);
			window.removeEventListener("storage", handleStorage);
		};
	}, [refresh]);

	const logout = useCallback(async () => {
		try {
			await api.post("/auth/logout");
		} catch {
			// Clear the local session even when the API cannot be reached.
		} finally {
			disconnectChatSocket();
			localStorage.removeItem("sustainx_token");
			localStorage.removeItem("sustainx_user");
			setUser(null);
			window.location.href = "/";
		}
	}, []);

	const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user), logout, refresh }), [user, loading, logout, refresh]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used inside AuthProvider.");
	return context;
}
