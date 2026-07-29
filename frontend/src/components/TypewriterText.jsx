import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter";

/**
 * 打字机逐字流光效果组件。
 * 文字逐字显示，末尾带闪烁光标，适合 AI 生成内容展示。
 *
 * @param {{ text: string, speed?: number, className?: string }} props
 */
export default function TypewriterText({ text = "", speed = 30, className = "" }) {
  const { displayedText, isTyping, start } = useTypewriter(text, speed);

  // 当传入 text 变化时重新开始打字
  useEffect(() => {
    if (text) {
      start();
    }
  }, [text, start]);

  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <span>{displayedText}</span>
      {isTyping && <span className="cursor-blink text-dream-accent">|</span>}
    </motion.div>
  );
}
