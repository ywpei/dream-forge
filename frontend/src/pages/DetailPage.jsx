import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TypewriterText from "../components/TypewriterText";
import AtmosphereBadge from "../components/AtmosphereBadge";
import apiClient, { getErrorMessage } from "../api/client";

const STYLE_NAMES = { healing: "治愈", fantasy: "奇幻", mystery: "悬疑", scifi: "科幻" };
const LENGTH_NAMES = { short: "精短篇", full: "完整短篇", outline: "小说大纲" };

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState("story");
  const [rewriteSelection, setRewriteSelection] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/stories/${id}`).then(async (storyRes) => {
      const story = storyRes.data;
      try {
        const dreamRes = await apiClient.get(`/dreams/${story.dream_id}`);
        setData({ story, dream: dreamRes.data });
      } catch {
        setData({ story, dream: null });
      }
    }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("确定删除这个故事吗？")) return;
    setActionLoading(true);
    try { await apiClient.delete(`/stories/${id}`); navigate("/library"); }
    catch (err) { alert(getErrorMessage(err)); }
    finally { setActionLoading(false); }
  };

  const handleContinue = async () => {
    if (!data) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/stories/${id}/continue`, { style: data.story.style, content: data.story.content });
      setData({ ...data, story: { ...data.story, content: data.story.content + "\n\n" + res.data.continued_content } });
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setActionLoading(false); }
  };

  const handleRewrite = async (newStyle) => {
    if (!data) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/stories/${id}/rewrite`, { style: newStyle, target_content: rewriteSelection || data.story.content });
      if (res.data.is_partial) {
        alert(`重写完成！\n\n${res.data.rewritten_content}`);
      } else {
        setData({ ...data, story: { ...data.story, content: res.data.rewritten_content, style: newStyle } });
      }
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setActionLoading(false); }
  };

  const handleTextSelect = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) setRewriteSelection(sel.toString().trim());
  };

  if (loading) return <div className="min-h-screen bg-transparent relative z-10 flex items-center justify-center"><div className="w-8 h-8 border-4 border-dream-accent/30 border-t-dream-accent rounded-full animate-spin" /></div>;

  if (error) return <div className="min-h-screen bg-transparent relative z-10 flex items-center justify-center"><div className="text-center"><p className="text-red-400 mb-4">{error}</p><button onClick={() => navigate("/library")} className="text-dream-accent hover:underline">返回故事库</button></div></div>;

  if (!data) return null;
  const { story, dream } = data;
  const interpretation = dream?.interpretation;

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/library")} className="text-sm text-dream-muted hover:text-dream-accent transition-colors">← 故事库</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-dream-text title-glow">{story.title}</h1>
            <AtmosphereBadge slogan={story.slogan} color={story.atmosphere_color} style={story.style} />
          </div>
          <div className="flex gap-3 text-xs text-dream-muted">
            <span>{STYLE_NAMES[story.style] || story.style}</span><span>·</span>
            <span>{LENGTH_NAMES[story.length] || story.length}</span><span>·</span>
            <span>{story.created_at ? new Date(story.created_at).toLocaleDateString("zh-CN") : ""}</span>
          </div>
        </motion.div>

        {dream?.dream?.content && (
          <details className="mb-6 group">
            <summary className="text-sm text-dream-muted cursor-pointer hover:text-dream-accent transition-colors">查看梦境原文</summary>
            <div className="mt-3 p-4 bg-dream-card/30 rounded-xl border border-dream-border text-sm text-dream-text/80 leading-relaxed">{dream.dream.content}</div>
          </details>
        )}

        {interpretation && (
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              {[{ key: "psychology", label: "心理学分析" }, { key: "literature", label: "文学隐喻" }, { key: "story", label: "故事正文" }].map((tab) => (
                <button key={tab.key} onClick={() => setDisplayMode(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${displayMode === tab.key ? "bg-dream-accent/20 text-dream-accent-light border border-dream-accent/50" : "text-dream-muted hover:text-dream-text border border-transparent"}`}>{tab.label}</button>
              ))}
            </div>
            <div className="bg-dream-card/30 border border-dream-border rounded-2xl p-6 shadow-glow card-glow">
              {displayMode === "psychology" && <div className="text-sm text-dream-text/90 leading-relaxed whitespace-pre-wrap"><TypewriterText text={interpretation.psychology || "暂无心理学解读"} speed={25} /></div>}
              {displayMode === "literature" && <div className="text-sm text-dream-text/90 leading-relaxed whitespace-pre-wrap"><TypewriterText text={interpretation.literature || "暂无文学解读"} speed={25} /></div>}
              {displayMode === "story" && <div className="text-sm sm:text-base text-dream-text/90 leading-relaxed whitespace-pre-wrap select-text" onMouseUp={handleTextSelect}><TypewriterText text={story.content} speed={20} /></div>}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-dream-border/50">
          <button onClick={handleContinue} disabled={actionLoading}
            className="px-5 py-2.5 bg-dream-accent text-white rounded-lg text-sm font-medium shadow-glow hover:shadow-glow-lg disabled:opacity-50 transition-all duration-200 btn-glow">✍️ 续写</button>

          <div className="relative group">
            <button disabled={actionLoading}
              className="px-5 py-2.5 border border-dream-border text-dream-muted rounded-lg text-sm hover:border-dream-accent hover:text-dream-accent transition-all duration-200">🎨 换风格</button>
            <div className="absolute top-full left-0 mt-1 w-32 bg-dream-card border border-dream-border rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
              {["healing", "fantasy", "mystery", "scifi"].map((s) => (
                <button key={s} onClick={() => handleRewrite(s)}
                  className="block w-full text-left px-4 py-2 text-sm text-dream-muted hover:text-dream-accent hover:bg-dream-accent/10 first:rounded-t-xl last:rounded-b-xl transition-colors">{STYLE_NAMES[s]}</button>
              ))}
            </div>
          </div>

          {rewriteSelection && (
            <div className="relative group">
              <button className="px-5 py-2.5 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/10 transition-all duration-200">✂️ 改写此段</button>
              <div className="absolute top-full left-0 mt-1 w-32 bg-dream-card border border-dream-border rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                {["healing", "fantasy", "mystery", "scifi"].map((s) => (
                  <button key={s} onClick={() => handleRewrite(s)}
                    className="block w-full text-left px-4 py-2 text-sm text-dream-muted hover:text-dream-accent hover:bg-dream-accent/10 first:rounded-t-xl last:rounded-b-xl transition-colors">{STYLE_NAMES[s]}</button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleDelete} disabled={actionLoading}
            className="px-5 py-2.5 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/10 disabled:opacity-50 transition-all duration-200 ml-auto">删除</button>
        </div>
      </div>
    </div>
  );
}