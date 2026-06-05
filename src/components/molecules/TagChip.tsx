"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tag } from "@/components/atoms/Tag";

interface TagChipProps {
  tag: { name: string; slug: string };
  active?: boolean;
  onClick?: (slug: string) => void;
  href?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * 标签芯片 — 点击可导航到对应的筛选列表
 * 支持外部 onClick 控制或内部 URL 导航
 */
export function TagChip({
  tag,
  active = false,
  onClick,
  href,
  size = "md",
  className = "",
}: TagChipProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    if (onClick) {
      onClick(tag.slug);
    } else if (href) {
      router.push(href);
    } else {
      // 默认行为：跳转到 /destinations?tags={slug}
      const params = new URLSearchParams(searchParams.toString());
      params.set("tags", tag.slug);
      params.delete("page");
      router.push(`/destinations?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <Tag
      label={tag.name}
      active={active}
      onClick={handleClick}
      size={size}
      className={className}
    />
  );
}
