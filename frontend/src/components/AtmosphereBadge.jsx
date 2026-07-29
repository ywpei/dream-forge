/**
 * 氛围 Slogan 标签组件。
 * 显示故事的氛围标语 + 对应配色。
 *
 * @param {{ slogan: string, color: string, style?: string }} props
 */
export default function AtmosphereBadge({ slogan, color = "#818cf8", style = "" }) {
  /** 风格中文名映射 */
  const styleNames = {
    healing: "治愈", fantasy: "奇幻",
    mystery: "悬疑", scifi: "科幻",
  };

  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
        borderWidth: 1,
      }}
    >
      {style && <span>{styleNames[style] || style}</span>}
      {slogan && <span>「{slogan}」</span>}
    </div>
  );
}
