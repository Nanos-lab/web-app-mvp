"use client";

import { useEffect, useRef } from "react";
import { useDeviceId } from "@/providers/DeviceProvider";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * 在详情页挂载时记录浏览，卸载时发送停留时长
 */
export function useRecordView(slug: string): void {
  const { deviceId, isReady } = useDeviceId();
  const mountTimeRef = useRef<number>(Date.now());
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (!isReady || !deviceId || hasRecordedRef.current) return;

    mountTimeRef.current = Date.now();
    hasRecordedRef.current = true;

    // 挂载时记录浏览
    fetch(`${API_BASE}/destinations/${slug}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": deviceId,
      },
      // 不发送 body — 后端记录首次浏览时间
    }).catch(() => {
      // 静默失败
    });

    // 卸载时发送停留时长
    const handleUnload = () => {
      const duration = Math.round(
        (Date.now() - mountTimeRef.current) / 1000
      );
      if (duration > 0) {
        // navigator.sendBeacon 保证页面关闭时也能发送
        const body = JSON.stringify({ duration_seconds: duration });
        navigator.sendBeacon(
          `${API_BASE}/destinations/${slug}/view`,
          new Blob([body], { type: "application/json" })
        );
      }
    };

    // 页面可见性变化时也记录（移动端切换应用）
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleUnload();
      } else if (document.visibilityState === "visible") {
        // 重新打开 — 重置计时器
        mountTimeRef.current = Date.now();
        fetch(`${API_BASE}/destinations/${slug}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Device-Id": deviceId,
          },
        }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      handleUnload();
    };
  }, [slug, deviceId, isReady]);
}
