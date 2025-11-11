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

  const ctaLink = authed ? null : { href: "/signup", label: "Get Started" };

  const isActive = (href: string) => pathname === href;

  async function handleSignOut() {
    await logout();
    setOpen(false);
    router.replace("/");
  }

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
            onClick={() => setOpen(false)}
          >
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white dark:text-gray-900 font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              NovaDrive
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {authed && (
              <button
                onClick={handleSignOut}
                className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Sign Out
              </button>
            )}
            
            {ctaLink && (
              <Link
                href={ctaLink.href}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {ctaLink.label}
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden flex flex-col gap-1.5 w-6 h-6 items-center justify-center"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className={`w-6 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${
              open ? "rotate-45 translate-y-2" : ""
            }`} />
            <span className={`w-6 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`} />
            <span className={`w-6 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? "max-h-96 pb-4" : "max-h-0"
        }`}>
          <nav className="flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium py-2 transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {authed && (
              <button
                onClick={handleSignOut}
                className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-left py-2"
              >
                Sign Out
              </button>
            )}
            
            {ctaLink && (
              <Link
                href={ctaLink.href}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center mt-2"
                onClick={() => setOpen(false)}
              >
                {ctaLink.label}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}