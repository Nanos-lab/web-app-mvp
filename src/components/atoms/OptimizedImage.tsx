"use client";

import React, { useState } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * 本地绝对路径补全为完整 URL（next/image 要求）
 */
function resolveSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return `${API_BASE}${src}`;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  aspectRatio,
  className = "",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  const handleLoad = () => {
    setStatus("loaded");
    onLoad?.();
  };

  const handleError = () => {
    setStatus("error");
    onError?.();
  };

  if (status === "error") {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <span className="text-sm">图片加载失败</span>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden bg-gray-100 ${fill ? "absolute inset-0" : "relative"} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* 加载中的骨架占位 */}
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      <Image
        src={resolveSrc(src)}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={`
          transition-opacity duration-300
          ${status === "loaded" ? "opacity-100" : "opacity-0"}
          ${fill ? "object-cover" : ""}
        `}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
