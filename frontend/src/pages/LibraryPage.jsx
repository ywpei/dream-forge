import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StoryCard from "../components/StoryCard";
import apiClient from "../api/client";

const STYLE_FILTERS = [
  { value: "", label: "全部" },
  { value: "healing", label: "治愈" },
  { value: "fantasy", label: "奇幻" },
  { value: "mystery", label: "悬疑" },
  { value: "scifi", label: "科幻" },
];

export default function LibraryPage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient.get("/stories/").then((res) => setStories(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredStories = stories.filter((s) => {
    const matchSearch = !search || s.title?.includes(search) || s.slogan?.includes(search);
    const matchFilter = !filter || s.style === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/")} className="text-sm text-dream-muted hover:text-dream-accent transition-colors">← 记录新梦境</button>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-dream-text mb-2 title-glow">故事库</h1>
          <p className="text-sm text-dream-muted">所有由梦境诞生的故事</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索故事标题..."
            className="flex-1 px-4 py-2.5 bg-dream-card/50 border border-dream-border rounded-xl text-dream-text placeholder-dream-muted/50 focus:border-dream-accent outline-none transition-all duration-200 input-glow" />
          <div className="flex gap-2 flex-wrap">
            {STYLE_FILTERS.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${filter === f.value ? "border-dream-accent bg-dream-accent/20 text-dream-accent-light" : "border-dream-border bg-dream-card/50 text-dream-muted hover:border-dream-accent/50"}`}>{f.label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-dream-accent/30 border-t-dream-accent rounded-full animate-spin" /></div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌙</div>
            <p className="text-dream-muted text-lg mb-2">还没有故事</p>
            <p className="text-dream-muted/60 text-sm mb-6">去记录一个梦境吧，故事将从那里诞生</p>
            <button onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-dream-accent text-white rounded-lg font-medium shadow-glow hover:shadow-glow-lg transition-all duration-200 btn-glow">记录梦境</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id} id={story.id} storyTitle={story.title}
                storyId={story.id} style={story.style}
                atmosphereColor={story.atmosphere_color}
                date={story.created_at ? new Date(story.created_at).toLocaleDateString("zh-CN") : ""}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}