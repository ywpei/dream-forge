import { useEffect, useRef } from "react";

/**
 * Canvas 2D 星空粒子背景组件。
 * 特点：
 *   - 3D 视差效果（不同层级的星星移动速度不同）
 *   - 星星随机闪烁（不同亮度、不同频率）
 *   - 自适应窗口大小
 *   - 高性能（限制粒子数、使用 requestAnimationFrame）
 */
export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId = null;
    let stars = [];
    let mouseX = 0;
    let mouseY = 0;

    // ======== 配置 ========
    const STAR_COUNT = 300;            // 星星总数
    const LAYERS = 3;                  // 星星层数（3D 层次）
    const MAX_SPEED = 0.15;            // 最大移动速度
    const MOUSE_INFLUENCE = 0.02;      // 鼠标交互影响系数

    // ======== 初始化星星 ========
    function initStars(width, height) {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        const layer = Math.floor(Math.random() * LAYERS);
        const depth = (layer + 1) / LAYERS; // 0.33 ~ 1.0
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: (0.5 + Math.random() * 1.5) * depth,
          baseAlpha: 0.3 + Math.random() * 0.7,  // 基础亮度
          alpha: 0.3 + Math.random() * 0.7,
          speed: (0.02 + Math.random() * MAX_SPEED) * depth,
          layer,
          // 闪烁参数
          twinkleSpeed: 0.005 + Math.random() * 0.03,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleAmplitude: 0.2 + Math.random() * 0.5,
        });
      }
    }

    // ======== 调整尺寸 ========
    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      initStars(w, h);
    }

    // ======== 鼠标跟踪 ========
    function handleMouseMove(e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    // ======== 动画循环 ========
    let time = 0;
    function animate() {
      time++;
      const w = canvas.width;
      const h = canvas.height;

      // 清空画布（透明背景）
      ctx.clearRect(0, 0, w, h);

      for (const star of stars) {
        // 闪烁：随时间正弦变化
        star.alpha = star.baseAlpha +
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * star.twinkleAmplitude;
        star.alpha = Math.max(0.1, Math.min(1, star.alpha));

        // 移动（3D 视差：浅层移动更快）
        star.x -= star.speed;
        star.x -= mouseX * MOUSE_INFLUENCE * star.speed * 50;

        // 添加缓慢的 Y 轴漂移
        star.y += Math.sin(time * 0.002 + star.twinklePhase) * 0.08;
        star.y += mouseY * MOUSE_INFLUENCE * star.speed * 30;

        // 边界回绕
        if (star.x < -10) star.x = w + 10;
        if (star.x > w + 10) star.x = -10;
        if (star.y < -10) star.y = h + 10;
        if (star.y > h + 10) star.y = -10;

        // 绘制星星
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        // 柔和径向渐变（光晕效果）
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 3,
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`);
        gradient.addColorStop(0.3, `rgba(200, 200, 255, ${star.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(200, 200, 255, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 较亮的星星额外画一个核心白点
        if (star.alpha > 0.7) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${(star.alpha - 0.7) * 3})`;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    // ======== 启动 ========
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    animationId = requestAnimationFrame(animate);

    // ======== 清理 ========
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}