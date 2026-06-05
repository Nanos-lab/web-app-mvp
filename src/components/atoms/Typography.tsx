import React from "react";

interface TypographyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  id?: string;
}

/** 页面主标题 */
export function H1({ children, as, className = "", id }: TypographyProps) {
  const Component = as ?? "h1";
  return (
    <Component
      id={id}
      className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-tight ${className}`}
    >
      {children}
    </Component>
  );
}

/** 区块标题 */
export function H2({ children, as, className = "", id }: TypographyProps) {
  const Component = as ?? "h2";
  return (
    <Component
      id={id}
      className={`text-2xl sm:text-3xl font-bold text-gray-900 leading-snug ${className}`}
    >
      {children}
    </Component>
  );
}

/** 子区块标题 */
export function H3({ children, as, className = "", id }: TypographyProps) {
  const Component = as ?? "h3";
  return (
    <Component
      id={id}
      className={`text-xl sm:text-2xl font-semibold text-gray-900 leading-snug ${className}`}
    >
      {children}
    </Component>
  );
}

export function H4({ children, as, className = "", id }: TypographyProps) {
  const Component = as ?? "h4";
  return (
    <Component
      id={id}
      className={`text-lg font-semibold text-gray-900 ${className}`}
    >
      {children}
    </Component>
  );
}

export function H5({ children, as, className = "", id }: TypographyProps) {
  const Component = as ?? "h5";
  return (
    <Component
      id={id}
      className={`text-base font-semibold text-gray-900 ${className}`}
    >
      {children}
    </Component>
  );
}

export function H6({ children, as, className = "", id }: TypographyProps) {
  const Component = as ?? "h6";
  return (
    <Component
      id={id}
      className={`text-sm font-semibold text-gray-900 ${className}`}
    >
      {children}
    </Component>
  );
}

/** 正文段落 */
export function Body({ children, as, className = "" }: TypographyProps) {
  const Component = as ?? "p";
  return (
    <Component
      className={`text-base text-gray-700 leading-relaxed ${className}`}
    >
      {children}
    </Component>
  );
}

/** 辅助说明文字 */
export function Caption({ children, as, className = "" }: TypographyProps) {
  const Component = as ?? "span";
  return (
    <Component className={`text-sm text-gray-500 ${className}`}>
      {children}
    </Component>
  );
}

/** 表单标签 */
export function Label({
  children,
  as,
  className = "",
  id,
}: TypographyProps) {
  const Component = as ?? "label";
  return (
    <Component
      id={id}
      className={`text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
    </Component>
  );
}
