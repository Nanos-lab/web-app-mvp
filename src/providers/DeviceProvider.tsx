"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface DeviceContextValue {
  deviceId: string | null;
  isReady: boolean;
  /** 强制重新生成设备 ID */
  regenerate: () => void;
}

const DeviceContext = createContext<DeviceContextValue>({
  deviceId: null,
  isReady: false,
  regenerate: () => {},
});

const STORAGE_KEY = "travel_app_device_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: 简单的 UUID v4 生成
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStoredDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeDeviceId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage 不可用时静默忽略
  }
}

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let id = getStoredDeviceId();
    if (!id) {
      id = generateUUID();
      storeDeviceId(id);
    }
    setDeviceId(id);
    setIsReady(true);
  }, []);

  const regenerate = useCallback(() => {
    const newId = generateUUID();
    storeDeviceId(newId);
    setDeviceId(newId);
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceId, isReady, regenerate }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDeviceId(): DeviceContextValue {
  return useContext(DeviceContext);
}
