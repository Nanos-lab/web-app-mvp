// ============================================================================
// API 错误处理 — 「100种不可思议旅行」
// ============================================================================

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/**
 * 将任意错误映射为对用户友好的中文描述
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    switch (error.status) {
      case 400:
        return "请求参数有误，请检查筛选条件";
      case 401:
        return "需要设备标识，请刷新页面后重试";
      case 404:
        return "未找到该内容";
      case 410:
        return "该内容已被移除";
      case 422:
        return "请求格式错误";
      case 500:
        return "服务器错误，请稍后重试";
      default:
        return error.message || "未知错误，请稍后重试";
    }
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "网络错误，请检查连接后重试";
  }

  return "网络错误，请检查连接后重试";
}
