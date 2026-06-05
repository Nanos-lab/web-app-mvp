import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import type { Category } from "@/types/api";

interface FooterProps {
  categories?: Category[];
}

export function Footer({ categories = [] }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 关于 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Compass size={20} className="text-primary-600" />
              <span className="font-bold text-gray-900">100种不可思议旅行</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              发现地球上最令人惊叹的小众旅行目的地。
              从天空之镜到地下萤火虫星河，每一条都是改变人生的旅行体验。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/destinations"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                  全部目的地
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                  我的收藏
                </Link>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 统计 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">项目统计</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-xl font-bold text-gray-900">100</div>
                <div className="text-xs text-gray-500">目的地</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-xl font-bold text-gray-900">
                  {categories.length || 8}
                </div>
                <div className="text-xs text-gray-500">分类</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-xl font-bold text-gray-900">6</div>
                <div className="text-xs text-gray-500">大洲</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} 100种不可思议旅行. 仅供学习与展示使用.
          </p>
        </div>
      </div>
    </footer>
  );
}
