"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/app/auth/AuthContext";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { isAuthenticated, loading, logout } = useAuth();

  const authed = useMemo(
    () => !loading && isAuthenticated,
    [loading, isAuthenticated],
  );

  const navLinks = useMemo(() => {
    if (authed) {
      return [
        { href: "/appointments", label: "Appointments" },
        { href: "/account", label: "My Garage" },
        { href: "/roadside-assistance", label: "Roadside Assistance" },
      ];
    }

    return [{ href: "/signin", label: "Sign In" }];
  }, [authed]);

  const ctaLink = authed
    ? { href: "/appointments", label: "Book Service" }
    : { href: "/signup", label: "Get Started" };

  const isActive = (href: string) => pathname === href;

  async function handleSignOut() {
    await logout();
    setOpen(false);
    router.replace("/");
  }

  return (
    <header className="bg-[rgba(8, 12, 24, 0.9)] sticky top-0 z-20 border-b border-solid border-[var(--border)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 p-4">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          NovaDrive Automotive
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="menu-bar" aria-hidden="true" />
          <span className="menu-bar" aria-hidden="true" />
          <span className="menu-bar" aria-hidden="true" />
        </button>
        <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {authed && (
            <Link
              href="/"
              onClick={(event) => {
                event.preventDefault();
                handleSignOut();
              }}
            >
              Sign Out
            </Link>
          )}
          <Link
            href={ctaLink.href}
            className={`cta ${isActive(ctaLink.href) ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {ctaLink.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
