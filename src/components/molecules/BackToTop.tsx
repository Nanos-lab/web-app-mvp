"use client";

import React from "react";
import { ArrowUp } from "lucide-react";
import { useScrollPosition } from "@/hooks/useScrollPosition";

interface BackToTopProps {
  threshold?: number; // px
}

export function BackToTop({ threshold = 400 }: BackToTopProps) {
  const scrollY = useScrollPosition();
  const visible = scrollY > threshold;

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="回到顶部"
      className={`
        fixed bottom-6 right-6 z-40
        flex items-center justify-center
        w-11 h-11 rounded-full
        bg-white border border-gray-200 shadow-md
        text-gray-500 hover:text-primary-600 hover:border-primary-300
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <ArrowUp size={20} />
    </button>
  );
}
