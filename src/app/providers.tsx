"use client";

import React from "react";
import { DeviceProvider } from "@/providers/DeviceProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { FavoritesProvider } from "@/providers/FavoritesProvider";

/**
 * 客户端 Context Provider 组合
 * 必须在 layout 中作为 Client Component 包裹 children
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DeviceProvider>
      <ToastProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </ToastProvider>
    </DeviceProvider>
  );
}
