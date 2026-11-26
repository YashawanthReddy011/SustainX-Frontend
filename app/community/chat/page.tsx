import { redirect } from "next/navigation";

export default function CommunityChatRoute() {
	redirect("/chat?community=1");
}
