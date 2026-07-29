import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const styleNames = { healing: "治愈", fantasy: "奇幻", mystery: "悬疑", scifi: "科幻" };

export default function StoryCard({ id, storyTitle, style, atmosphereColor = "#818cf8", date }) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
      <Link to={`/detail/${id}`}
        className="block bg-dream-card/50 backdrop-blur border border-dream-border rounded-2xl overflow-hidden hover:border-dream-accent/50 transition-all duration-200 group card-glow">
        <div className="h-1.5" style={{ backgroundColor: atmosphereColor }} />
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${atmosphereColor}20`, color: atmosphereColor }}>
              {styleNames[style] || style}
            </span>
          </div>
          <h3 className="font-semibold text-dream-text group-hover:text-dream-accent transition-colors line-clamp-1">
            {storyTitle || "未命名故事"}
          </h3>
          <p className="text-sm text-dream-muted line-clamp-2">来自一段梦境</p>
          <p className="text-xs text-dream-muted/60">{date}</p>
        </div>
      </Link>
    </motion.div>
  );
}