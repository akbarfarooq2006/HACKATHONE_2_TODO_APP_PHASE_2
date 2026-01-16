"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isAuthenticated = !!session?.user;

  const handleSignOut = async () => {
    // Sign out logic will be handled by Better Auth
    setProfileMenuOpen(false);
    router.push("/sign-in");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className="text-xl font-bold text-foreground hover:text-accent transition-colors"
            >
              TaskApp
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-sm">
                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-card py-2">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-foreground opacity-60 truncate">
                        {session?.user?.email || "user@example.com"}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a
                  href="/sign-in"
                  className={`text-foreground hover:text-accent transition-colors ${
                    isActive("/sign-in") ? "text-accent font-semibold" : ""
                  }`}
                >
                  Sign In
                </a>
                <a
                  href="/sign-up"
                  className="bg-accent text-white px-4 py-2 rounded hover:opacity-90 transition-opacity"
                >
                  Get Started
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-foreground">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-foreground opacity-60 truncate">
                      {session?.user?.email || "user@example.com"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-foreground hover:text-accent transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/sign-in"
                    className={`text-foreground hover:text-accent transition-colors ${
                      isActive("/sign-in") ? "text-accent font-semibold" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="/sign-up"
                    className="bg-accent text-white px-4 py-2 rounded hover:opacity-90 transition-opacity text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
