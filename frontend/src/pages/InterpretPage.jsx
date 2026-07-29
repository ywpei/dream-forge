import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import InterpretPanel from "../components/InterpretPanel";
import apiClient, { getErrorMessage } from "../api/client";

export default function InterpretPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dreamId = searchParams.get("id");

  const [psychology, setPsychology] = useState("");
  const [literature, setLiterature] = useState("");
  const [aiEmotion, setAiEmotion] = useState("");
  const [dreamTitle, setDreamTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dreamId) {
      setError("缺少梦境 ID");
      setLoading(false);
      return;
    }

    const fetchInterpretation = async () => {
      try {
        const dreamRes = await apiClient.get(`/dreams/${dreamId}`);
        const dream = dreamRes.data.dream;
        setDreamTitle(dream.title || "");

        const tags = typeof dream.emotion_tags === "string"
          ? (dream.emotion_tags ? JSON.parse(dream.emotion_tags) : [])
          : (dream.emotion_tags || []);

        const interpRes = await apiClient.post(`/dreams/${dreamId}/interpret`, {
          content: dream.content,
          emotion_tags: tags.length > 0 ? tags : ["困惑"],
        });
        setPsychology(interpRes.data.psychology);
        setLiterature(interpRes.data.literature);
        setAiEmotion(interpRes.data.ai_emotion || "");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchInterpretation();
  }, [dreamId]);

  const goToCreate = () => navigate(`/create?id=${dreamId}`);
  const goHome = () => navigate("/");

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={goHome} className="text-sm text-dream-muted hover:text-dream-accent transition-colors flex items-center gap-1">
            ← 返回
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-dream-text mb-2 title-glow">
            {dreamTitle || "梦境解读"}
          </h1>
          <p className="text-sm text-dream-muted">AI 从心理学和文学两个维度为你解读</p>
        </motion.div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-6">{error}</div>
        )}

        <InterpretPanel psychology={psychology} literature={literature} aiEmotion={aiEmotion} loading={loading} />

        {psychology && literature && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-10"
          >
            <button
              onClick={goToCreate}
              className="px-8 py-3 bg-dream-accent text-white rounded-xl font-medium shadow-glow hover:shadow-glow-lg hover:bg-dream-accent-light transition-all duration-200 btn-glow"
            >
              基于解读创作故事 →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}