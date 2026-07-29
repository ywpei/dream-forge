import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import StyleSelector from "../components/StyleSelector";
import TypewriterText from "../components/TypewriterText";
import AtmosphereBadge from "../components/AtmosphereBadge";
import apiClient, { getErrorMessage } from "../api/client";

export default function CreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dreamId = searchParams.get("id");

  const [style, setStyle] = useState("fantasy");
  const [length, setLength] = useState("full");
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!dreamId) { setError("缺少梦境 ID"); return; }
    setGenerating(true);
    setError("");
    setStory(null);
    try {
      const res = await apiClient.post(`/dreams/${dreamId}/generate`, { style, length });
      setStory(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const goToLibrary = () => navigate("/library");
  const goBack = () => navigate(`/interpret?id=${dreamId}`);

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={goBack} className="text-sm text-dream-muted hover:text-dream-accent transition-colors">← 返回解读</button>
          <button onClick={goToLibrary} className="text-sm text-dream-muted hover:text-dream-accent transition-colors">📚 故事库</button>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-dream-text mb-2 title-glow">创作你的故事</h1>
          <p className="text-sm text-dream-muted">选择风格和篇幅，让 AI 将梦境织成故事</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-dream-card/40 backdrop-blur-xl border border-dream-border rounded-2xl p-6 sm:p-8 mb-6 shadow-glow card-glow">
          <StyleSelector style={style} length={length} onStyleChange={setStyle} onLengthChange={setLength} />
          <div className="mt-6 text-center">
            <motion.button
              onClick={handleGenerate} disabled={generating}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-10 py-3.5 bg-dream-accent text-white rounded-xl font-medium text-lg shadow-glow hover:shadow-glow-lg hover:bg-dream-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-glow"
            >
              {generating ? (
                <span className="flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  正在编织梦境...
                </span>
              ) : "开始编织"}
            </motion.button>
          </div>
        </motion.div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-6">{error}</div>}

        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-dream-accent/20 animate-breathe" />
              <div className="absolute inset-2 rounded-full bg-dream-accent/30 animate-breathe" style={{ animationDelay: "0.5s" }} />
              <div className="absolute inset-4 rounded-full bg-dream-accent animate-breathe loading-glow" style={{ animationDelay: "1s" }} />
            </div>
            <p className="text-dream-muted text-sm">正在编织你的梦境故事...</p>
          </motion.div>
        )}

        {story && !generating && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="bg-dream-card/40 backdrop-blur-xl border border-dream-border rounded-2xl p-6 sm:p-8 shadow-glow card-glow">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-dream-text title-glow">{story.title}</h2>
              <AtmosphereBadge slogan={story.slogan} color={story.atmosphere_color} style={style} />
            </div>
            <div className="text-sm sm:text-base text-dream-text/90 leading-relaxed whitespace-pre-wrap">
              <TypewriterText text={story.content} speed={20} />
            </div>
            <div className="mt-8 pt-6 border-t border-dream-border/50 flex flex-wrap gap-3">
              <button onClick={goToLibrary}
                className="px-6 py-2.5 bg-dream-accent text-white rounded-lg font-medium shadow-glow hover:shadow-glow-lg transition-all duration-200 btn-glow">📚 存入故事库</button>
              <button onClick={handleGenerate}
                className="px-6 py-2.5 border border-dream-border text-dream-muted rounded-lg hover:border-dream-accent hover:text-dream-accent transition-all duration-200">🔄 重新生成</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}