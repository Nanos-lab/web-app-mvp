"use client";

import { Button } from "@/components/atoms/Button";
import { H1, Body } from "@/components/atoms/Typography";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <AlertTriangle size={64} className="text-amber-400 mb-4" />
      <H1>出错了</H1>
      <Body className="mt-2 text-gray-500 max-w-md">
        抱歉，页面加载时出现了错误。请刷新页面后重试。
      </Body>
      <div className="mt-6 flex gap-3">
        <Button variant="primary" onClick={reset}>
          重新加载
        </Button>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/")}
        >
          返回首页
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 max-w-lg text-left">
          <summary className="text-sm text-gray-400 cursor-pointer">
            错误详情
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto max-h-64">
            {error.message}
            {"\n\n"}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
