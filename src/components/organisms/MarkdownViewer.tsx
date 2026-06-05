import React from "react";

interface MarkdownViewerProps {
  htmlContent: string;
  className?: string;
}

export function MarkdownViewer({
  htmlContent,
  className = "",
}: MarkdownViewerProps) {
  if (!htmlContent) {
    return (
      <div className="text-gray-400 text-sm italic">
        暂无详细介绍
      </div>
    );
  }

  return (
    <div
      className={`
        prose prose-gray max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-gray-700 prose-p:leading-relaxed
        prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl prose-img:shadow-md
        prose-strong:text-gray-900
        prose-li:text-gray-700 prose-li:leading-relaxed
        prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
