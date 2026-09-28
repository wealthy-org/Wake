"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WakeLogo, GitHubIcon } from "@/components/icons";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onScrollTo?: (sectionId: string) => void;
}

export function Header({ onScrollTo }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onScrollTo) {
      onScrollTo(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-[#fafaf9]/95 backdrop-blur-md transition-colors shrink-0">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-8">
        {/* Left: Wake Identity */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-zinc-950 focus-visible:outline-offset-4 rounded-md"
            aria-label="Wake Home"
          >
            <WakeLogo />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium text-zinc-600 bg-zinc-200/60 rounded border border-zinc-300/60">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Local Software
          </span>
        </div>

        {/* Desktop Nav: Exactly technical documentation links */}
        <nav
          className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-zinc-600"
          aria-label="Main Navigation"
        >
          <a
            href="#what-you-see"
            onClick={(e) => handleNavClick(e, "what-you-see")}
            className="hover:text-zinc-950 transition-colors py-1 cursor-pointer"
          >
            What you see
          </a>
          <a
            href="#install"
            onClick={(e) => handleNavClick(e, "install")}
            className="hover:text-zinc-950 transition-colors py-1 cursor-pointer"
          >
            Install
          </a>
          <a
            href="#demo"
            onClick={(e) => handleNavClick(e, "demo")}
            className="hover:text-zinc-950 transition-colors py-1 cursor-pointer"
          >
            Demo
          </a>
          <a
            href="#architecture"
            onClick={(e) => handleNavClick(e, "architecture")}
            className="hover:text-zinc-950 transition-colors py-1 cursor-pointer"
          >
            Architecture
          </a>
          <a
            href="#limits"
            onClick={(e) => handleNavClick(e, "limits")}
            className="hover:text-zinc-950 transition-colors py-1 cursor-pointer"
          >
            Limits
          </a>
          <a
            href="#faq"
            onClick={(e) => handleNavClick(e, "faq")}
            className="hover:text-zinc-950 transition-colors py-1 cursor-pointer"
          >
            FAQ
          </a>

          <div className="h-4 w-px bg-zinc-300" aria-hidden="true" />

          <a
            href="https://github.com/wealthy-org/Wake"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-zinc-950 transition-colors py-1"
          >
            <GitHubIcon className="size-3.5 text-zinc-500" />
            <span>GitHub</span>
          </a>

          <Button
            size="sm"
            onClick={() => {
              const el = document.getElementById("install");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-md bg-zinc-950 hover:bg-black text-white text-xs font-mono font-medium h-8 px-3.5 cursor-pointer border border-zinc-900 shadow-2xs hover:shadow-xs transition-all"
          >
            Install Wake
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              const el = document.getElementById("install");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-md bg-zinc-950 hover:bg-black text-white text-xs font-mono font-medium h-8 px-3 cursor-pointer"
          >
            Install
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="p-1.5 rounded-md text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-[#fafaf9] px-6 py-4 shadow-sm animate-in slide-in-from-top-1 duration-150">
          <nav className="flex flex-col gap-3 font-mono text-xs text-zinc-700">
            <a
              href="#what-you-see"
              onClick={(e) => handleNavClick(e, "what-you-see")}
              className="py-1.5 hover:text-zinc-950 cursor-pointer"
            >
              What you see
            </a>
            <a
              href="#install"
              onClick={(e) => handleNavClick(e, "install")}
              className="py-1.5 hover:text-zinc-950 cursor-pointer"
            >
              Install
            </a>
            <a
              href="#demo"
              onClick={(e) => handleNavClick(e, "demo")}
              className="py-1.5 hover:text-zinc-950 cursor-pointer"
            >
              Demo
            </a>
            <a
              href="#architecture"
              onClick={(e) => handleNavClick(e, "architecture")}
              className="py-1.5 hover:text-zinc-950 cursor-pointer"
            >
              Architecture
            </a>
            <a
              href="#limits"
              onClick={(e) => handleNavClick(e, "limits")}
              className="py-1.5 hover:text-zinc-950 cursor-pointer"
            >
              Honest limits
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "faq")}
              className="py-1.5 hover:text-zinc-950 cursor-pointer"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
              <a
                href="https://github.com/wealthy-org/Wake"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-1 text-zinc-700 hover:text-zinc-950"
              >
                <GitHubIcon className="size-3.5 text-zinc-500" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
