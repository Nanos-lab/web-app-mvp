"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="面包屑导航" className={`py-3 ${className}`}>
      <ol className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
        {/* 首页 */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary-600 transition-colors"
            aria-label="回到首页"
          >
            <Home size={15} />
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-gray-300 shrink-0" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary-600 transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
