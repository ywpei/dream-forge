import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DreamInput from "../components/DreamInput";
import apiClient, { getErrorMessage } from "../api/client";

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [privateSaved, setPrivateSaved] = useState(false);

  const handleSubmit = async (dreamData) => {
    setLoading(true);
    setError("");
    setPrivateSaved(false);

    if (dreamData.is_private) {
      try {
        const privateDreams = JSON.parse(localStorage.getItem("dreamforge_private") || "[]");
        privateDreams.push({
          id: Date.now(),
          title: dreamData.title,
          content: dreamData.content,
          emotion_tags: dreamData.emotion_tags,
          date: dreamData.date,
          is_private: true,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("dreamforge_private", JSON.stringify(privateDreams));
        setPrivateSaved(true);
      } catch (err) {
        setError("本地保存失败，请重试");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await apiClient.post("/dreams/", dreamData);
      navigate(`/interpret?id=${res.data.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-dream-accent/5 to-transparent pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 py-12 sm:py-20">
        {/* 标题区域 — 带发光效果 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-dream-text mb-3 title-glow-lg">
            记录你的梦境
          </h1>
          <p className="text-lg text-dream-muted">
            让 AI 为你编织另一个世界
          </p>
        </motion.div>

        {privateSaved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm text-center"
          >
            🔒 梦境已本地保存（未上传云端）
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dream-card/40 backdrop-blur-xl border border-dream-border rounded-2xl p-6 sm:p-8 shadow-glow card-glow"
        >
          <DreamInput onSubmit={handleSubmit} loading={loading} />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate("/library")}
            className="text-sm text-dream-muted hover:text-dream-accent transition-colors"
          >
            📚 查看故事库
          </button>
        </motion.div>
      </div>
    </div>
  );
}