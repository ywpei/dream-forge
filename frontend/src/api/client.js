import axios from "axios";

/**
 * Axios API 客户端封装。
 * baseURL 通过 Vite 代理指向后端，所有请求自动处理 JSON。
 */
const apiClient = axios.create({
  baseURL: "/api",
  timeout: 60000,          // AI 生成可能较慢，设长超时
  headers: { "Content-Type": "application/json" },
});

/**
 * 处理 API 错误，返回友好的错误提示文本。
 */
export function getErrorMessage(error) {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return "请求失败，请稍后重试";
}

export default apiClient;
