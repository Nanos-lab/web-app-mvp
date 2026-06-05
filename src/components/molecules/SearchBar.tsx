"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchBar({
  value: externalValue = "",
  onChange,
  placeholder = "搜索目的地...",
  debounceMs = 400,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localValue, setLocalValue] = useState(externalValue);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // 外部 value 变化时同步（如 URL 参数变化）
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const applySearch = useCallback(
    (searchValue: string) => {
      if (onChange) {
        onChange(searchValue);
      } else {
        // 内置路由导航：通过 URL search 参数驱动搜索
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue.trim()) {
          params.set("search", searchValue.trim());
        } else {
          params.delete("search");
        }
        params.delete("page");
        router.push(`/destinations?${params.toString()}`, { scroll: false });
      }
    },
    [onChange, router, searchParams]
  );

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      if (debounceTimer) clearTimeout(debounceTimer);

      const timer = setTimeout(() => {
        applySearch(newValue);
      }, debounceMs);
      setDebounceTimer(timer);
    },
    [applySearch, debounceMs, debounceTimer]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceTimer) clearTimeout(debounceTimer);
      applySearch(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue("");
    if (debounceTimer) clearTimeout(debounceTimer);
    applySearch("");
  };

  // 清理
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="search"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          w-full rounded-lg border border-gray-300 bg-white
          pl-10 pr-4 py-2 text-sm
          placeholder:text-gray-400
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        `}
        aria-label="搜索目的地"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="清除搜索"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
