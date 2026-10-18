"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Leaf,
  LayoutDashboard,
  LogOut,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const links = [
    { name: "Home", href: "/" },
    { name: "SDGs", href: "/sdgs" },
    { name: "Challenges", href: "/challenges" },
    { name: "Projects", href: "/projects" },
    { name: "Community", href: "/community" },
    { name: "EcoGuard", href: "/earth" },
  ];

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
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#53635a] transition hover:bg-[#edf7f0] hover:text-[#0f5132]"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl border border-[#d5e4d9] px-3 py-2 text-sm font-bold text-[#0f5132]"
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
              <Link href="/login" className="btn-primary">
                <UserCircle size={17} />
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-[#0f5132] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-[#e4ece6] py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-[#53635a] hover:bg-[#edf7f0] hover:text-[#0f5132]"
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="mt-2 rounded-xl bg-[#edf7f0] px-4 py-3 font-bold text-[#0f5132]"
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
