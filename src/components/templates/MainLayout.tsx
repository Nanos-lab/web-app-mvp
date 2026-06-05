"use client";

import React from "react";
import { Navbar } from "@/components/organisms/Navbar";
import { Footer } from "@/components/organisms/Footer";
import { BackToTop } from "@/components/molecules/BackToTop";
import type { Category } from "@/types/api";

interface MainLayoutProps {
  children: React.ReactNode;
  categories?: Category[];
}

/**
 * 主布局模板：Navbar + <main> + Footer + BackToTop
 * 用于包装所有页面的持久 chrome
 */
export function MainLayout({ children, categories = [] }: MainLayoutProps) {
  const navCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    icon: c.icon,
  }));

  return (
    <>
      <Navbar categories={navCategories} />
      <main className="min-h-screen">{children}</main>
      <Footer categories={categories} />
      <BackToTop />
    </>
  );
}
