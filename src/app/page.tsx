"use client";

import React, { useState } from "react";
import { Header } from "@/components/layouts";
import { Hero } from "@/components/sections";
import { InstallModal, DocsModal } from "@/components/modals";

export default function Home() {
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] text-zinc-900 selection:bg-zinc-950 selection:text-white antialiased">
      {/* 1. Header (fixed height: 4rem on mobile, 5rem on desktop) */}
      <Header
        onOpenInstall={() => setInstallModalOpen(true)}
        onOpenDocs={() => setDocsModalOpen(true)}
      />

      {/* 2. Main content area (Hero fits 1st screen on desktop, seamlessly scrollable when additional sections are added below) */}
      <main className="flex-1 flex flex-col w-full">
        <Hero onOpenInstall={() => setInstallModalOpen(true)} />
        {/* Future sections can be added here and will be scrolled to naturally */}
      </main>

      {/* Accessible Modals */}
      <InstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
      <DocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />
    </div>
  );
}
