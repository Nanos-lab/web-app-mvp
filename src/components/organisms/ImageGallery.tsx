"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { OptimizedImage } from "@/components/atoms/OptimizedImage";
import { Skeleton } from "@/components/atoms/Skeleton";
import type { DestinationImage } from "@/types/api";

interface ImageGalleryProps {
  images: DestinationImage[];
  coverImageUrl?: string;
  altBase: string;
}

export function ImageGallery({
  images,
  coverImageUrl,
  altBase,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // 如果没有照片，显示封面图
  const displayImages = images.length > 0
    ? images
    : coverImageUrl
      ? [{ id: 0, url: coverImageUrl, thumbnail_url: coverImageUrl, alt_text: altBase, width: 1200, height: 800, photographer: "", source: "", license: "" }]
      : [];

  const selectedImage =
    selectedIndex !== null ? displayImages[selectedIndex] : null;

  // Lightbox 打开时锁定 body 滚动
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  // 键盘导航
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          setSelectedIndex((prev) =>
            prev !== null ? (prev === 0 ? displayImages.length - 1 : prev - 1) : null
          );
          break;
        case "ArrowRight":
          setSelectedIndex((prev) =>
            prev !== null ? (prev === displayImages.length - 1 ? 0 : prev + 1) : null
          );
          break;
        case "Escape":
          setSelectedIndex(null);
          setIsZoomed(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, displayImages.length]);

  // Touch swipe
  const touchStartX = React.useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 70) {
      setSelectedIndex((prev) => {
        if (prev === null) return null;
        if (delta > 0) return prev === 0 ? displayImages.length - 1 : prev - 1;
        return prev === displayImages.length - 1 ? 0 : prev + 1;
      });
    }
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    setIsZoomed(false);
  }, []);

  // Loading
  if (displayImages.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[16/9] flex items-center justify-center text-gray-400">
        <span className="text-sm">暂无图片</span>
      </div>
    );
  }

  return (
    <div>
      {/* 主图 + 缩略图 */}
      <div className="space-y-3">
        {/* 封面大图 */}
        <button
          onClick={() => setSelectedIndex(0)}
          className="relative w-full rounded-xl overflow-hidden bg-gray-100 aspect-[16/9] cursor-pointer group"
          aria-label="查看大图"
        >
          <OptimizedImage
            src={displayImages[0].url}
            alt={displayImages[0].alt_text || altBase}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="group-hover:scale-105 transition-transform duration-500"
          />
          {/* 图片计数 */}
          {displayImages.length > 1 && (
            <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs backdrop-blur-sm">
              1 / {displayImages.length}
            </span>
          )}
        </button>

        {/* 缩略图条 */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
            {displayImages.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setSelectedIndex(index)}
                className={`
                  relative shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-gray-100
                  cursor-pointer transition-all duration-200 snap-start
                  ${selectedIndex === index
                    ? "ring-2 ring-primary-500 ring-offset-2"
                    : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                  }
                `}
                aria-label={`查看第 ${index + 1} 张图片`}
              >
                <OptimizedImage
                  src={img.thumbnail_url || img.url}
                  alt={img.alt_text || `${altBase} 图 ${index + 1}`}
                  fill
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && selectedImage && (
        <div
          className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 关闭按钮 */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="关闭大图"
          >
            <X size={24} />
          </button>

          {/* 缩放按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label={isZoomed ? "缩小" : "放大"}
          >
            {isZoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
          </button>

          {/* 图片计数 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm backdrop-blur-sm">
            {selectedIndex + 1} / {displayImages.length}
          </div>

          {/* 上一张 */}
          {displayImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null ? (prev === 0 ? displayImages.length - 1 : prev - 1) : null
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors hidden sm:block"
              aria-label="上一张"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* 下一张 */}
          {displayImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null ? (prev === displayImages.length - 1 ? 0 : prev + 1) : null
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors hidden sm:block"
              aria-label="下一张"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* 图片 */}
          <div
            className={`flex items-center justify-center transition-transform duration-300 ${
              isZoomed ? "cursor-zoom-out scale-150" : "cursor-zoom-in"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            style={{ maxWidth: "90vw", maxHeight: "90vh" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                selectedImage.url.startsWith("http")
                  ? selectedImage.url
                  : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${selectedImage.url}`
              }
              alt={selectedImage.alt_text || altBase}
              className="max-w-full max-h-[90vh] object-contain select-none"
              draggable={false}
            />
          </div>

          {/* 摄影师署名 */}
          {selectedImage.photographer && (
            <div className="absolute bottom-4 left-4 z-10 text-white/60 text-xs">
              &copy; {selectedImage.photographer}
              {selectedImage.source && ` / ${selectedImage.source}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
