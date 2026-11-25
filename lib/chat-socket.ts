import { io, type Socket } from "socket.io-client";

const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/+$/, "");
const apiUrl = configuredApiUrl.endsWith("/api") ? `${configuredApiUrl}/v1` : configuredApiUrl;
const socketUrl = apiUrl.replace(/\/api(?:\/v1)?\/?$/, "");
let socket: Socket | null = null;
let socketToken = "";

export function getChatSocket() {
	if (typeof window === "undefined") return null;
	const token = localStorage.getItem("sustainx_token") || "";
	if (!token) return null;
	if (socket && socketToken === token) return socket;
	socket?.disconnect();
	socketToken = token;
	socket = io(socketUrl, { auth: { token }, transports: ["websocket", "polling"] });
	return socket;
}

export function disconnectChatSocket() {
	socket?.disconnect();
	socket = null;
	socketToken = "";
}
