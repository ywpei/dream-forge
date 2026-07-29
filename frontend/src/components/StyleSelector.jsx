import { motion } from "framer-motion";

export const STYLES = {
  healing: { label: "治愈", icon: "🌿", color: "#86efac", description: "温暖、疗愈，像一杯热可可" },
  fantasy: { label: "奇幻", icon: "🦄", color: "#c084fc", description: "魔法、传说，通往异世界" },
  mystery: { label: "悬疑", icon: "🔍", color: "#94a3b8", description: "谜团、反转，真相藏于暗处" },
  scifi: { label: "科幻", icon: "🚀", color: "#60a5fa", description: "未来、科技，星辰大海" },
};

export const LENGTH_OPTIONS = [
  { value: "short", label: "精短篇", desc: "300-500字" },
  { value: "full", label: "完整短篇", desc: "1200-2000字" },
  { value: "outline", label: "小说大纲", desc: "世界观+三幕结构" },
];

export default function StyleSelector({ style, length, onStyleChange, onLengthChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-dream-muted mb-3">选择风格</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STYLES).map(([key, s]) => (
            <motion.button key={key} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              onClick={() => onStyleChange(key)}
              className={`p-4 rounded-xl border text-center transition-all duration-200 card-glow ${
                style === key ? "border-dream-accent bg-dream-accent/10 shadow-glow" : "border-dream-border bg-dream-card/50 hover:border-dream-accent/50"
              }`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-sm font-medium text-dream-text">{s.label}</div>
              <div className="text-xs text-dream-muted mt-0.5">{s.description}</div>
            </motion.button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-dream-muted mb-3">选择篇幅</h3>
        <div className="flex flex-wrap gap-2">
          {LENGTH_OPTIONS.map((opt) => (
            <motion.button key={opt.value} type="button" whileTap={{ scale: 0.95 }}
              onClick={() => onLengthChange(opt.value)}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                length === opt.value ? "border-dream-accent bg-dream-accent/20 text-dream-accent-light" : "border-dream-border bg-dream-card/50 text-dream-muted hover:border-dream-accent/50"
              }`}>
              <span>{opt.label}</span>
              <span className="ml-1.5 text-xs opacity-60">{opt.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}