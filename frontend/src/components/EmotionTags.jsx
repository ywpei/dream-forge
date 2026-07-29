import { motion } from "framer-motion";

export const EMOTIONS = ["焦虑", "困惑", "兴奋", "悲伤", "宁静", "恐惧", "期待", "压抑"];
const EMOTION_ICONS = { "焦虑": "😰", "困惑": "🤔", "兴奋": "🤩", "悲伤": "😢", "宁静": "😌", "恐惧": "😨", "期待": "🥹", "压抑": "😶" };

export default function EmotionTags({ selected = [], onChange }) {
  const toggle = (emotion) => {
    onChange(selected.includes(emotion) ? selected.filter((e) => e !== emotion) : [...selected, emotion]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {EMOTIONS.map((emotion) => {
        const isActive = selected.includes(emotion);
        return (
          <motion.button key={emotion} type="button" whileTap={{ scale: 0.95 }}
            onClick={() => toggle(emotion)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              isActive
                ? "bg-dream-accent/20 border-dream-accent text-dream-accent-light shadow-glow"
                : "bg-dream-card/50 border-dream-border text-dream-muted hover:border-dream-accent/50 hover:text-dream-text btn-glow"
            }`}
          >
            <span>{EMOTION_ICONS[emotion]}</span>
            <span>{emotion}</span>
          </motion.button>
        );
      })}
    </div>
  );
}