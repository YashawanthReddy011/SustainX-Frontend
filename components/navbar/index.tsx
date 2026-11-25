"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Leaf,
  LayoutDashboard,
  LogOut,
  UserCircle,
  MessageCircle,
  Bell,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { getChatSocket } from "../../lib/chat-socket";
import { getUnreadChatCount } from "../../services/platform.service";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    let active = true;
    const refreshCount = () => { void getUnreadChatCount().then((count) => { if (active) setUnreadCount(count); }).catch(() => undefined); };
    refreshCount();
    const socket = getChatSocket();
    socket?.on("notification:new", refreshCount);
    window.addEventListener("sustainx:chat-read", refreshCount);
    return () => {
      active = false;
      socket?.off("notification:new", refreshCount);
      window.removeEventListener("sustainx:chat-read", refreshCount);
    };
  }, [isAuthenticated, pathname]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { name: "Home", href: "/" },
    { name: "SDGs", href: "/sdgs" },
    { name: "Challenges", href: "/challenges" },
    { name: "Projects", href: "/projects" },
    { name: "Community", href: "/community" },
    { name: "EcoGuard", href: "/ecoguard" },
  ];
  const isActive = (href: string) => href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
  const navClass = (href: string) => isActive(href)
    ? "rounded-lg bg-[#edf7f0] px-3 py-2 text-sm font-bold text-[#0f5132]"
    : "rounded-lg px-3 py-2 text-sm font-semibold text-[#53635a] transition hover:bg-[#edf7f0] hover:text-[#0f5132]";
  const chatLink = <Link href="/chat" onClick={() => setOpen(false)} aria-current={pathname.startsWith("/chat") ? "page" : undefined} aria-label={`Community chat${unreadCount ? `, ${unreadCount} unread` : ""}`} className={`relative flex items-center gap-2 rounded-xl border border-[#d5e4d9] px-3 py-2 text-sm font-bold ${pathname.startsWith("/chat") ? "bg-[#edf7f0] text-[#0f5132]" : "text-[#0f5132]"}`}>
    <MessageCircle size={16} />Chat{unreadCount > 0 && <span className="rounded-full bg-[#c43e49] px-1.5 py-0.5 text-[10px] leading-4 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
  </Link>;
  const notificationLink = <Link href="/chat" onClick={() => setOpen(false)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} title="Chat notifications" className="relative rounded-xl border border-[#d5e4d9] p-2 text-[#0f5132]">
    <Bell size={18} />{unreadCount > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#c43e49]" />}
  </Link>;

  return (
    <header className="sticky top-0 z-50 border-b border-[#dce7df] bg-white/95 backdrop-blur">
      <div className="page-container">
        <div className="flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f5132] text-white shadow-md">
              <Leaf size={21} />
            </div>

            <div>
              <div className="text-[18px] font-extrabold tracking-tight text-[#0f5132]">
                SustainX
              </div>

              <div className="hidden text-[10px] font-semibold text-[#718077] sm:block">
                STUDENTS • SOCIETY • EARTH
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={navClass(link.href)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                {chatLink}
                {notificationLink}
                <Link
                  href="/dashboard"
                  aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-xl border border-[#d5e4d9] px-3 py-2 text-sm font-bold ${pathname.startsWith("/dashboard") ? "bg-[#edf7f0] text-[#0f5132]" : "text-[#0f5132]"}`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-xl bg-[#0f5132] px-4 py-2 text-sm font-bold text-white"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" aria-current={pathname === "/login" ? "page" : undefined} className="btn-primary">
                <UserCircle size={17} />
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-[#0f5132] lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="primary-mobile-nav"
          >
            {open ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {open && (
          <div id="primary-mobile-nav" className="border-t border-[#e4ece6] py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`${isActive(link.href) ? "bg-[#edf7f0] text-[#0f5132]" : "text-[#53635a]"} rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#edf7f0] hover:text-[#0f5132]`}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  {chatLink}
                  {notificationLink}
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
                    className={`mt-2 rounded-xl px-4 py-3 font-bold ${pathname.startsWith("/dashboard") ? "bg-[#0f5132] text-white" : "bg-[#edf7f0] text-[#0f5132]"}`}
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="mt-1 rounded-xl bg-[#0f5132] px-4 py-3 text-left font-bold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  aria-current={pathname === "/login" ? "page" : undefined}
                  className="mt-2 rounded-xl bg-[#0f5132] px-4 py-3 font-bold text-white"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
