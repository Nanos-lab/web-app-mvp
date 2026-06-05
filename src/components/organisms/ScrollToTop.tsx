"use client";

import React from "react";
import { BackToTop } from "@/components/molecules/BackToTop";

interface ScrollToTopProps {
  threshold?: number;
}

/**
 * 页面级「回到顶部」包装器。
 * 目前直接复用 BackToTop molecule，预留页面级配置扩展空间。
 */
export function ScrollToTop({ threshold = 400 }: ScrollToTopProps) {
  return <BackToTop threshold={threshold} />;
}
