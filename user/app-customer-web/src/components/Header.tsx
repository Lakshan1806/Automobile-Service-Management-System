"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/appointments", label: "Appointments" },
  { href: "/account", label: "My Garage" },
  { href: "/roadside-assistance", label: "Roadside" },
  { href: "/signin", label: "Sign In" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="site-header">
      <div className="container">
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/signup"
            className={`cta ${isActive("/signup") ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
