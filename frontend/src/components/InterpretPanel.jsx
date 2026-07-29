import { motion } from "framer-motion";
import TypewriterText from "./TypewriterText";

export default function InterpretPanel({ psychology, literature, aiEmotion, loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-dream-accent/30 border-t-dream-accent rounded-full animate-spin" />
          <p className="text-dream-muted text-sm">正在解读你的梦境...</p>
        </div>
      </div>
    );
  }
  if (!psychology && !literature) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        className="bg-dream-card/50 backdrop-blur border border-dream-border rounded-2xl p-6 shadow-glow card-glow">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🫥</span>
          <h3 className="text-lg font-semibold text-dream-text">心理学分析</h3>
        </div>
        <div className="text-xs text-amber-400/80 bg-amber-400/5 rounded-lg px-3 py-2 mb-4">
          ⚠️ 本解读仅作参考，不构成专业心理咨询
        </div>
        <div className="text-sm text-dream-text/90 leading-relaxed whitespace-pre-wrap">
          <TypewriterText text={psychology} speed={25} />
        </div>
        {aiEmotion && (
          <div className="mt-4 pt-4 border-t border-dream-border/50">
            <p className="text-xs text-dream-accent/80">🤖 AI 情绪补充：{aiEmotion}</p>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-dream-card/50 backdrop-blur border border-dream-border rounded-2xl p-6 shadow-glow card-glow">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h3 className="text-lg font-semibold text-dream-text">文学隐喻</h3>
        </div>
        <div className="text-sm text-dream-text/90 leading-relaxed whitespace-pre-wrap">
          <TypewriterText text={literature} speed={25} />
        </div>
      </motion.div>
    </div>
  );
}