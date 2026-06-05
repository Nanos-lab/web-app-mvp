"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  size?: "sm" | "md";
  variant?: "icon-only" | "text+icon";
  className?: string;
}

const sizeMap = { sm: 16, md: 20 };

export function ShareButton({
  title,
  text,
  url,
  size = "md",
  variant = "icon-only",
  className = "",
}: ShareButtonProps) {
  const { showToast } = useToast();
  const iconSize = sizeMap[size];

  const handleShare = async () => {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const shareData = {
      title,
      text: text ?? title,
      url: shareUrl,
    };

    // 优先使用 Web Share API（移动端原生分享面板）
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 用户取消分享 — 不操作
        if ((err as DOMException).name === "AbortError") return;
      }
      return;
    }

    // 桌面端 fallback：复制链接到剪贴板
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("链接已复制", "success");
    } catch {
      // 最后 fallback：选中文本让用户手动复制
      showToast("分享链接失败，请手动复制浏览器地址", "error");
    }
  };

  if (variant === "text+icon") {
    return (
      <button
        onClick={handleShare}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg
          text-sm text-gray-600 hover:bg-gray-100
          transition-colors touch-target
          ${className}
        `}
      >
        <Share2 size={iconSize} />
        <span>分享</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`
        inline-flex items-center justify-center
        rounded-lg text-gray-400 hover:text-gray-600
        transition-colors touch-target
        ${className}
      `}
      aria-label="分享此页"
      title="分享"
    >
      <Share2 size={iconSize} />
    </button>
  );
}
