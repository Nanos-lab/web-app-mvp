"use client";

import { useRecordView } from "@/hooks/useRecordView";

interface ViewTrackerProps {
  slug: string;
}

/**
 * 不可见的浏览追踪组件 — 挂载时记录浏览，卸载时发送停留时长
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  useRecordView(slug);
  return null;
}
