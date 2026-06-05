import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { H1, Body } from "@/components/atoms/Typography";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <span className="text-7xl mb-4">🧭</span>
      <H1>页面未找到</H1>
      <Body className="mt-2 text-gray-500 max-w-md">
        你来到了未知领域！此页面不存在或已被移动。不如回到主页重新探索？
      </Body>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button variant="primary">返回首页</Button>
        </Link>
        <Link href="/destinations">
          <Button variant="secondary">浏览目的地</Button>
        </Link>
      </div>
    </div>
  );
}
