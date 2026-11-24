"use client";

import { useEffect, useState } from "react";
import type { User } from "../types";
import api from "../lib/api";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("sustainx_token");
		if (!token) { setUser(null); setLoading(false); return; }
		api.get<User>("/auth/me").then(({ data }) => {
			setUser(data);
			localStorage.setItem("sustainx_user", JSON.stringify(data));
		}).catch(() => setUser(null)).finally(() => setLoading(false));
	}, []);

	const logout = () => {
		localStorage.removeItem("sustainx_token");
		localStorage.removeItem("sustainx_user");

		setUser(null);

		window.location.href = "/";
	};

	return {
		user,
		loading,
		isAuthenticated: Boolean(user),
		logout,
	};
}
