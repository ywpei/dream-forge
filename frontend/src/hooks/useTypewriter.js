import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 打字机逐字输出 Hook。
 * 支持中断（页面切换时停止）、自定义速度。
 *
 * @param {string} text - 要逐字显示的文字
 * @param {number} speed - 每字间隔（毫秒），默认 30ms
 * @returns {{ displayedText: string, isTyping: boolean, start: () => void, reset: () => void }}
 */
export function useTypewriter(text = "", speed = 30) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  // 停止打字
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTyping(false);
  }, []);

  // 重置
  const reset = useCallback(() => {
    stop();
    indexRef.current = 0;
    setDisplayedText("");
  }, [stop]);

  // 开始打字
  const start = useCallback(() => {
    reset();
    if (!text) return;
    setIsTyping(true);
    mountedRef.current = true;

    timerRef.current = setInterval(() => {
      if (!mountedRef.current) {
        stop();
        return;
      }
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayedText(text);
        stop();
      } else {
        setDisplayedText(text.slice(0, indexRef.current));
      }
    }, speed);
  }, [text, speed, reset, stop]);

  // 组件卸载时停止
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  // 当 text 变化时自动重置
  useEffect(() => {
    reset();
  }, [text, reset]);

  return { displayedText, isTyping, start, reset };
}
