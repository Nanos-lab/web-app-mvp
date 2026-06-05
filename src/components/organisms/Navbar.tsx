"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart, Compass } from "lucide-react";

interface NavCategory {
  name: string;
  slug: string;
  icon?: string;
}

interface NavbarProps {
  categories?: NavCategory[];
}

export function Navbar({ categories = [] }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 移动端菜单打开时锁定 body 滚动
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const navLinks = [
    { href: "/", label: "首页", exact: true },
    { href: "/destinations", label: "目的地" },
    { href: "/favorites", label: "收藏", icon: <Heart size={15} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-lg text-gray-900 shrink-0"
          >
            <Compass size={24} className="text-primary-600" />
            <span className="hidden sm:inline">100种不可思议旅行</span>
            <span className="sm:hidden">不可思议旅行</span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-1" aria-label="主导航">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${link.exact
                    ? (pathname === link.href ? "text-primary-600 bg-primary-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")
                    : (isActive(link.href) && link.href !== "/" ? "text-primary-600 bg-primary-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* 分类下拉 */}
            {categories.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  className={`
                    flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors
                    ${isActive("/categories") ? "text-primary-600 bg-primary-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}
                  `}
                  aria-expanded={isDropdownOpen}
                >
                  分类
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl py-2 min-w-[200px] z-50">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/categories/${cat.slug}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                      >
                        {cat.icon && <span className="text-lg">{cat.icon}</span>}
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* 移动端汉堡按钮 */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 touch-target"
            aria-label={isMobileOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 移动端侧滑菜单 */}
      {isMobileOpen && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* 菜单面板 */}
          <nav
            className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl md:hidden
                       animate-slide-in-right overflow-y-auto"
            aria-label="移动端导航"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">导航菜单</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 touch-target"
                aria-label="关闭菜单"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium
                    ${link.exact
                      ? (pathname === link.href ? "text-primary-600 bg-primary-50" : "text-gray-700 hover:bg-gray-50")
                      : (isActive(link.href) && link.href !== "/" ? "text-primary-600 bg-primary-50" : "text-gray-700 hover:bg-gray-50")
                    }
                  `}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {/* 分类分组 */}
              {categories.length > 0 && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="px-3 text-xs uppercase tracking-wider text-gray-400 mb-2">分类</p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-base text-gray-700 hover:bg-gray-50"
                    >
                      {cat.icon && <span className="text-xl">{cat.icon}</span>}
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
