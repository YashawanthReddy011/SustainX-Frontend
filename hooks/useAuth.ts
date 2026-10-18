"use client";

import { useEffect, useState } from "react";
import type { User } from "../types";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			const storedUser = localStorage.getItem("sustainx_user");

			if (storedUser) {
				setUser(JSON.parse(storedUser));
			}
		} catch {
			localStorage.removeItem("sustainx_user");
		} finally {
			setLoading(false);
		}
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
