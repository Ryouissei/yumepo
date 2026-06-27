import React, { useEffect, useRef } from "react";

interface DreamCanvasProps {
  colors: string[];
  emotions: string[];
  motifs: string[];
  width?: number;
  height?: number;
}

// Map Japanese color names to beautiful hex codes with alpha transparency
const colorMap: { [key: string]: string } = {
  "青": "rgba(37, 99, 235, 0.6)",
  "暗い青": "rgba(15, 32, 67, 0.85)",
  "紺": "rgba(23, 37, 84, 0.9)",
  "水色": "rgba(125, 211, 252, 0.7)",
  "藍色": "rgba(30, 58, 138, 0.8)",
  "赤": "rgba(220, 38, 38, 0.6)",
  "朱色": "rgba(234, 88, 12, 0.7)",
  "夕暮れの赤": "rgba(194, 65, 12, 0.8)",
  "夕焼け": "rgba(249, 115, 22, 0.7)",
  "白": "rgba(255, 255, 255, 0.85)",
  "蛍光灯の白": "rgba(241, 245, 249, 0.9)",
  "霧の白": "rgba(243, 244, 246, 0.75)",
  "クリーム色": "rgba(254, 253, 237, 0.8)",
  "黒": "rgba(9, 9, 11, 0.95)",
  "漆黒": "rgba(2, 6, 23, 0.98)",
  "夜の黒": "rgba(3, 7, 18, 0.95)",
  "黄": "rgba(234, 179, 8, 0.7)",
  "月光の黄色": "rgba(253, 224, 71, 0.8)",
  "金": "rgba(202, 138, 4, 0.75)",
  "紫": "rgba(147, 51, 234, 0.6)",
  "ラベンダー": "rgba(192, 132, 252, 0.7)",
  "薄いラベンダー": "rgba(216, 180, 254, 0.65)",
  "緑": "rgba(22, 163, 74, 0.6)",
  "やわらかいミント": "rgba(167, 243, 208, 0.7)",
  "深緑": "rgba(6, 78, 59, 0.8)",
  "ピンク": "rgba(236, 72, 153, 0.6)",
  "桃色": "rgba(244, 114, 182, 0.7)",
  "グレー": "rgba(107, 114, 128, 0.6)",
  "霧のグレー": "rgba(156, 163, 175, 0.75)"
};

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  return `rgba(${Math.abs(r) % 150 + 50}, ${Math.abs(g) % 150 + 50}, ${Math.abs(b) % 200 + 50}, 0.6)`;
}

export const DreamCanvas: React.FC<DreamCanvasProps> = ({
  colors = [],
  emotions = [],
  motifs = [],
  width = 400,
  height = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolve color list to rgba strings
    const resolvedColors = colors.map(c => {
      // Direct match
      if (colorMap[c]) return colorMap[c];
      // Substring match
      const key = Object.keys(colorMap).find(k => c.includes(k) || k.includes(c));
      if (key) return colorMap[key];
      // Generative based on string hash
      return stringToColor(c);
    });

    if (resolvedColors.length === 0) {
      resolvedColors.push("rgba(15, 23, 42, 0.95)"); // Deep Space Slate
      resolvedColors.push("rgba(147, 51, 234, 0.6)"); // Purple
      resolvedColors.push("rgba(56, 189, 248, 0.5)"); // Light blue
    } else if (resolvedColors.length === 1) {
      resolvedColors.push("rgba(15, 23, 42, 0.9)");
      resolvedColors.push("rgba(192, 132, 252, 0.4)");
    }

    let animationFrameId: number;
    let time = 0;

    // Create particles representing motifs or emotions
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      pulseRate: number;
      phase: number;
    }> = [];

    // Initialize random but stable particles based on emotions/motifs length
    const particleCount = Math.max(8, motifs.length * 2 + emotions.length * 2);
    for (let i = 0; i < particleCount; i++) {
      const colIndex = i % resolvedColors.length;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 25 + 5,
        color: resolvedColors[colIndex],
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        pulseRate: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }

    const draw = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw base gradient (background)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      // Use the first resolved colors as background base
      bgGrad.addColorStop(0, resolvedColors[0].replace(/0\.\d+\)/, "1)")); 
      bgGrad.addColorStop(1, (resolvedColors[1] || resolvedColors[0]).replace(/0\.\d+\)/, "0.95)"));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw emotional atmospheric layers
      ctx.save();
      // Use blur filters if supported, otherwise normal transparency
      ctx.globalCompositeOperation = "screen";

      // If anxiety/rush (焦り) is present, draw jagged lightning-like or fast orbit rings
      const hasAnxiety = emotions.some(e => e.includes("焦り") || e.includes("焦") || e.includes("不安") || e.includes("恐怖"));
      const hasNostalgia = emotions.some(e => e.includes("懐かしさ") || e.includes("寂しさ") || e.includes("切なさ") || e.includes("温かい"));

      if (hasAnxiety) {
        // Jagged, tense overlapping lines
        ctx.strokeStyle = resolvedColors[2] || resolvedColors[1] || "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < width; x += 15) {
          const sineNoise = Math.sin(x * 0.05 + time * 0.05) * 20;
          const noise = Math.cos(x * 0.1 - time * 0.08) * 10;
          const y = height / 2 + sineNoise + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Pulsating orbital rings
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = width * 0.25;
        const currentRadius = baseRadius + Math.sin(time * 0.03) * 15;
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Draw soft, blending orbs (Dream atmosphere)
      particles.forEach((p, idx) => {
        // Update positions
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;

        const currentPulse = Math.sin(time * p.pulseRate + p.phase);
        const radius = Math.max(1, p.radius + currentPulse * 4);

        // Draw radial glowing gradient
        const orbGrad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, radius * 2.5
        );
        
        // Ensure color has alpha
        const colorWithAlpha = p.color;
        orbGrad.addColorStop(0, colorWithAlpha);
        orbGrad.addColorStop(0.5, colorWithAlpha.replace(/[^,]+\)/, "0.15)"));
        orbGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw symbolic motifs
      // If nostalgia or warm, draw a steady bright glowing core
      if (hasNostalgia) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const centerGrad = ctx.createRadialGradient(
          width / 2, height * 0.4, 0,
          width / 2, height * 0.4, width * 0.3
        );
        centerGrad.addColorStop(0, "rgba(253, 224, 71, 0.45)"); // Soft warm amber
        centerGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.15)"); // Lavender
        centerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.4, width * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw elegant abstract lines representing "paths" or "roads" in the dream
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.85);
      // Gentle bezier curve representing paths
      ctx.bezierCurveTo(
        width * 0.35, height * 0.85 - Math.sin(time * 0.005) * 20,
        width * 0.65, height * 0.55 + Math.cos(time * 0.007) * 25,
        width, height * 0.65
      );
      ctx.stroke();

      // Additional background grid lines for structure (extremely faint)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.restore();

      // 5. Draw overlay soft light vignette
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.4,
        width / 2, height / 2, width * 0.75
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(11, 15, 25, 0.45)"); // Slate shadow frame
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Gentle floating overlay dust (magical dream dust)
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      for (let i = 0; i < 6; i++) {
        const x = (Math.sin(time * 0.01 + i * 50) * 0.4 + 0.5) * width;
        const y = ((time * 0.15 + i * 80) % height);
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors, emotions, motifs, width, height]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-white/10 shadow-2xl shadow-indigo-950/40">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block object-cover w-full h-full aspect-square"
      />
      {/* Sleek glassmorphism details */}
      <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-2xl" />
      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/5 pointer-events-none">
        <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">DREAM PRINT</span>
      </div>
    </div>
  );
};
