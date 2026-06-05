import React from "react";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900" />

      {/* 装饰性圆形 */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] rounded-full bg-primary-600/20 blur-3xl" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[50%] h-[100%] rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center py-16 sm:py-24 lg:py-32">
          {/* 标签 */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-white/10 text-white/80 text-sm font-medium mb-6 backdrop-blur-sm">
            <Globe size={16} />
            发现不可思议的世界
          </span>

          {/* 主标题 */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight max-w-4xl">
            100 种
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
              {" "}不可思议{" "}
            </span>
            旅行
          </h1>

          {/* 副标题 */}
          <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl leading-relaxed">
            从玻利维亚天空之镜到新西兰地下萤火虫星河，
            探索地球上最令人惊叹的 100 个小众目的地
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/destinations"
              className="
                inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
                bg-white text-primary-700 font-bold text-base
                hover:bg-gray-100 active:bg-gray-200
                transition-all duration-200 shadow-lg shadow-black/20
                hover:shadow-xl hover:shadow-black/30 hover:scale-[1.02]
              "
            >
              开始探索
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/categories"
              className="
                inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
                bg-white/10 text-white font-medium text-base
                hover:bg-white/20 active:bg-white/15
                transition-all duration-200 backdrop-blur-sm
              "
            >
              浏览分类
            </Link>
          </div>

          {/* 统计栏 */}
          <div className="mt-16 grid grid-cols-3 gap-8 sm:gap-16">
            {[
              { value: "100+", label: "精选目的地" },
              { value: "8", label: "主题分类" },
              { value: "6", label: "覆盖大洲" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
