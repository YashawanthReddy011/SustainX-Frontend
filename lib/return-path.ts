const RETURN_PATH_ORIGIN = "https://sustainx.invalid";

export function normalizeReturnPath(value: string | null | undefined): string | null {
	if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
	try {
		const target = new URL(value, RETURN_PATH_ORIGIN);
		if (target.origin !== RETURN_PATH_ORIGIN) return null;
		return `${target.pathname}${target.search}${target.hash}`;
	} catch {
		return null;
	}
}

export function safeReturnPath(value: string | null | undefined, fallback = "/dashboard") {
	return normalizeReturnPath(value) || fallback;
}
