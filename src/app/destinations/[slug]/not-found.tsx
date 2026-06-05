import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { H1, Body } from "@/components/atoms/Typography";

export default function DestinationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-6xl mb-4">🗺️</span>
      <H1>目的地未找到</H1>
      <Body className="mt-2 text-gray-500 max-w-md">
        抱歉，我们找不到该目的地。它可能已被移除，或者您输入的链接有误。
      </Body>
      <div className="mt-6 flex gap-3">
        <Link href="/destinations">
          <Button variant="primary">浏览目的地</Button>
        </Link>
        <Link href="/">
          <Button variant="secondary">返回首页</Button>
        </Link>
      </div>
    </div>
  );
}
