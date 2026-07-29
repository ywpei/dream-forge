import { useState } from "react";
import { motion } from "framer-motion";
import EmotionTags from "./EmotionTags";

export default function DreamInput({ onSubmit, loading = false }) {
  const [content, setContent] = useState("");
  const [emotionTags, setEmotionTags] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) { setError("请描述你的梦境片段"); return; }
    onSubmit({ title: title.trim(), content: content.trim(), emotion_tags: emotionTags, date, is_private: isPrivate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-dream-muted mb-1.5">梦境标题（可选）</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="给你的梦取个名字..."
          className="input-glow w-full px-4 py-2.5 bg-dream-card/50 border border-dream-border rounded-xl text-dream-text placeholder-dream-muted/50 focus:border-dream-accent outline-none transition-all duration-200" />
      </div>

      <div>
        <label className="block text-sm font-medium text-dream-muted mb-1.5">描述你的梦境 <span className="text-red-400">*</span></label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="昨晚梦见了什么？描述一下那片梦境片段..."
          rows={6}
          className="input-glow w-full px-4 py-3 bg-dream-card/50 border border-dream-border rounded-xl text-dream-text placeholder-dream-muted/50 resize-none focus:border-dream-accent outline-none transition-all duration-200 min-h-[200px]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-dream-muted mb-2">醒来时的感受（可多选）</label>
        <EmotionTags selected={emotionTags} onChange={setEmotionTags} />
      </div>

      <div>
        <label className="block text-sm font-medium text-dream-muted mb-1.5">梦境日期</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="input-glow px-4 py-2 bg-dream-card/50 border border-dream-border rounded-xl text-dream-text focus:border-dream-accent outline-none transition-all duration-200" />
      </div>

      {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm">{error}</motion.p>}

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${isPrivate ? "bg-dream-accent" : "bg-dream-border"}`}
            onClick={() => setIsPrivate(!isPrivate)}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow`}
              style={{ left: isPrivate ? "22px" : "2px" }} />
          </div>
          <span className="text-sm text-dream-muted group-hover:text-dream-text transition-colors">🔒 私密模式（仅本地存储）</span>
        </label>

        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-glow px-8 py-3 rounded-xl font-medium text-base bg-dream-accent text-white shadow-glow hover:shadow-glow-lg hover:bg-dream-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              正在编织梦境...
            </span>
          ) : "开始解读"}
        </motion.button>
      </div>
    </form>
  );
}