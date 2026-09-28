"use client";

import React from "react";
import { Header, Footer } from "@/components/layouts";
import {
  Hero,
  WhatYouSee,
  InstallSection,
  DemoSection,
  ChainReadingSection,
  HonestLimits,
  FAQSection,
} from "@/components/sections";

export default function Home() {
  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] text-zinc-900 selection:bg-zinc-900 selection:text-zinc-50 antialiased">
      {/* Navigation Header */}
      <Header onScrollTo={handleScrollTo} />

      {/* Main Documentation Content — Strictly ordered per product brief */}
      <main className="flex-1 flex flex-col w-full">
        {/* 1. HERO */}
        <Hero />

        {/* 2. WHAT YOU SEE */}
        <WhatYouSee />

        {/* 3. INSTALL IN 3 STEPS */}
        <InstallSection />

        {/* 4. DEMO */}
        <DemoSection />

        {/* 5. HOW IT READS THE CHAIN */}
        <ChainReadingSection />

        {/* 6. HONEST LIMITS */}
        <HonestLimits />

        {/* 7. FAQ */}
        <FAQSection />
      </main>

      {/* 8. FOOTER */}
      <Footer />
    </div>
  );
}
