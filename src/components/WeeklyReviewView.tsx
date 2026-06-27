import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { WeeklySummary, DreamEntry } from "../types";
import { Calendar, Heart, Compass, Sparkles, RefreshCw } from "lucide-react";

interface WeeklyReviewProps {
  onSelectDream?: (dream: DreamEntry) => void;
}

// Map weather string to numeric value for plotting (5 = High/Sunny, 1 = Low/Stormy)
const weatherValueMap: { [key: string]: number } = {
  "晴れ": 5,
  "柔らかい光": 5,
  "薄曇り": 4,
  "夜明け前": 4,
  "小雨": 3,
  "風が強い": 3,
  "霧": 3,
  "静かな雨": 2,
  "濃霧": 2,
  "嵐": 1
};

const getWeatherLevelName = (value: number): string => {
  if (value >= 5) return "穏やか・光";
  if (value >= 4) return "薄曇・内省";
  if (value >= 3) return "雨・霧・風";
  if (value >= 2) return "静寂・濃霧";
  return "嵐・荒波";
};

export const WeeklyReviewView: React.FC<WeeklyReviewProps> = () => {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/weekly");
      if (!response.ok) {
        throw new Error("週間集計の取得に失敗しました。");
      }
      const data = await response.json();
      setSummary(data);
    } catch (err: any) {
      console.error(err);
      setError("週間レビューを読み込めませんでした。夢を記録して、もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklySummary();
  }, []);

  // Compute SVG Points for the weather chart
  const chartPoints = React.useMemo(() => {
    if (!summary || !summary.weather_history || summary.weather_history.length < 2) return null;
    
    const history = summary.weather_history;
    const width = 500;
    const height = 180;
    const paddingX = 40;
    const paddingY = 20;

    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const points = history.map((h, i) => {
      const val = weatherValueMap[h.weather] || 3;
      // Map x uniformly
      const x = paddingX + (i / (history.length - 1)) * usableWidth;
      // Map y (inverted so higher score = higher up on the screen)
      // Mapped val of 1-5 to height range
      const percentY = (val - 1) / 4; // 0 to 1
      const y = paddingY + usableHeight - percentY * usableHeight;
      return { x, y, weather: h.weather, date: h.date };
    });

    // Create path command
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Area path closing coordinates
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return { pathD, areaD, points, width, height, paddingX, paddingY };
  }, [summary]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border border-indigo-200 animate-pulse" />
          <div className="absolute inset-2 rounded-full border border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-xs text-[#5c5d6e] font-mono tracking-wider">GENERATING WEEKLY SUMMARY...</p>
      </div>
    );
  }

  if (error || !summary || summary.dream_count === 0) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-6 bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] max-w-xl mx-auto shadow-xl">
        <div className="p-3.5 bg-[#e6e6fa]/40 border border-indigo-200/30 rounded-full mb-4 text-[#5c5d6e]">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="font-display text-lg font-normal text-[#191c1d] mb-2">今週の夢の記録がまだありません</h3>
        <p className="text-xs text-[#46464c] max-w-xs mb-6 leading-relaxed">
          夢守りが一週間の心の傾向をまとめるには、少なくとも1つ以上の夢ログが必要です。朝、夢を覚えているときにぜひ記録してみてください。
        </p>
        <button
          onClick={fetchWeeklySummary}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5c5d6e] hover:bg-[#4d6077] text-white font-medium text-xs tracking-wider transition-all cursor-pointer shadow-md shadow-[#5c5d6e]/5 hover:scale-105 active:scale-95 duration-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          再読み込みする
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-6 text-slate-800">
      
      {/* Banner Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Metaphor Spotlight */}
        <div className="md:col-span-8 p-6 bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] text-left flex flex-col justify-between shadow-lg shadow-slate-900/5">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#5c5d6e] tracking-widest uppercase mb-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              WEEKLY SPIRIT METAPHOR
            </div>
            <h2 className="font-display text-2xl font-normal text-[#191c1d] tracking-wide leading-snug mb-3">
              今週のあなたの心のメタファー
            </h2>
            <div className="bg-[#eee9bd]/25 border border-[#eee9bd]/30 p-4 rounded-[24px]">
              <p className="text-sm font-display text-[#191c1d] font-normal leading-relaxed italic">
                「 {summary.weekly_metaphor} 」
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#46464c] leading-relaxed mt-4 font-sans">
            今週記録された {summary.dream_count} つの夢のかけらたちを結び合わせ、心の底流にあるテーマをそっと言語化しました。
          </p>
        </div>

        {/* Short Stats Card */}
        <div className="md:col-span-4 p-6 bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] text-left flex flex-col justify-between shadow-lg shadow-slate-900/5">
          <div>
            <span className="font-mono text-[9px] text-[#77767d] tracking-widest block uppercase mb-4 font-semibold">LOG STATISTICS</span>
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-200/20">
                <span className="text-[10px] text-[#77767d] block font-mono">今週の夢の記録数</span>
                <span className="text-3xl font-display font-light text-[#191c1d] mt-1 block">
                  {summary.dream_count} <span className="text-xs text-[#77767d] font-normal font-mono">cards</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#77767d] block font-mono">庭の新芽・開拓エリア</span>
                <span className="text-base font-display font-normal text-[#51647b] mt-1 block truncate">
                  {summary.garden_updates.length > 0 
                    ? `+ ${summary.garden_updates.slice(0, 2).join(", ")}` 
                    : "現状維持"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={fetchWeeklySummary}
            className="mt-6 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/60 hover:bg-white/80 border border-slate-200 text-xs text-[#46464c] hover:text-[#191c1d] transition-all cursor-pointer font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            集計を更新する
          </button>
        </div>

      </div>

      {/* Inner Weather Trend Chart */}
      <div className="p-6 bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] text-left shadow-lg shadow-slate-900/5">
        <h3 className="font-display text-sm font-normal text-[#191c1d] tracking-wide mb-4">
          心の天気の推移
        </h3>

        {chartPoints ? (
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="min-w-[500px] h-[200px] relative">
              <svg 
                viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                className="w-full h-full"
              >
                <defs>
                  {/* Glowing gradient under the line */}
                  <linearGradient id="chartGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(230, 230, 250, 0.45)" />
                    <stop offset="100%" stopColor="rgba(230, 230, 250, 0)" />
                  </linearGradient>
                  {/* Soft trace line gradient */}
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#5c5d6e" />
                    <stop offset="100%" stopColor="#4d6077" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Guideline grids */}
                {[1, 2, 3, 4, 5].map((val) => {
                  const percentY = (val - 1) / 4;
                  const y = chartPoints.paddingY + (chartPoints.height - chartPoints.paddingY * 2) - percentY * (chartPoints.height - chartPoints.paddingY * 2);
                  return (
                    <g key={val} className="opacity-70">
                      <line
                        x1={chartPoints.paddingX}
                        y1={y}
                        x2={chartPoints.width - chartPoints.paddingX}
                        y2={y}
                        stroke="rgba(92, 93, 110, 0.1)"
                        strokeWidth="0.75"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={chartPoints.paddingX - 10}
                        y={y + 3}
                        className="font-sans text-[8px] fill-[#77767d] text-right font-medium"
                        textAnchor="end"
                      >
                        {getWeatherLevelName(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area underneath the path */}
                <path d={chartPoints.areaD} fill="url(#chartGlow)" />

                {/* Curved Connection Path */}
                <path
                  d={chartPoints.pathD}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Active Interactive Dots */}
                {chartPoints.points.map((pt, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#5c5d6e"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="8"
                      className="fill-[#e6e6fa]/30 opacity-0 hover:opacity-100 transition-opacity"
                    />
                    {/* Tiny X-axis label */}
                    <text
                      x={pt.x}
                      y={chartPoints.height - 5}
                      className="font-mono text-[8px] fill-[#77767d]"
                      textAnchor="middle"
                    >
                      {idx + 1}日目
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        ) : (
          <div className="h-[150px] flex items-center justify-center text-xs text-[#77767d]">
            天気の推移を描くには、複数の夢ログが必要です。
          </div>
        )}
      </div>

      {/* Grid of Emotions and Motifs Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Emotions Panel */}
        <div className="p-6 bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] text-left shadow-lg shadow-slate-900/5">
          <h4 className="flex items-center gap-1.5 text-xs font-mono text-[#5c5d6e] uppercase tracking-wider mb-4 font-bold">
            <Heart className="w-4 h-4 text-[#5c5d6e]" />
            今週よく出た感情傾向
          </h4>
          <div className="space-y-3.5">
            {summary.top_emotions.map((emo, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#191c1d]">{emo.name}</span>
                  <span className="font-mono text-[#77767d] text-[11px] font-medium">{emo.count} 回出現</span>
                </div>
                {/* Visual Bar percentage representation */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full" 
                    style={{ width: `${Math.min(100, (emo.count / summary.dream_count) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motifs Panel */}
        <div className="p-6 bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] text-left shadow-lg shadow-slate-900/5">
          <h4 className="flex items-center gap-1.5 text-xs font-mono text-[#5c5d6e] uppercase tracking-wider mb-4 font-bold">
            <Compass className="w-4 h-4 text-[#5c5d6e]" />
            今週よく出たモチーフ・象徴
          </h4>
          <div className="space-y-3.5">
            {summary.top_motifs.map((mot, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#191c1d]">{mot.name}</span>
                  <span className="font-mono text-[#77767d] text-[11px] font-medium">{mot.count} 回出現</span>
                </div>
                {/* Visual Bar percentage representation */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" 
                    style={{ width: `${Math.min(100, (mot.count / summary.dream_count) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Synthesis & Core Guidance for next week */}
      <div className="p-6 bg-[#e6e6fa]/35 border border-indigo-200/30 rounded-[32px] text-left shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4.5 h-4.5 text-red-500 shrink-0" />
          <h3 className="font-display text-base font-normal text-[#191c1d] tracking-wide">
            来週に向けた小さなセルフケア
          </h3>
        </div>
        <div className="bg-white/40 p-4 rounded-[20px] border border-white/50 shadow-sm">
          <p className="text-xs text-[#46464c] leading-relaxed font-sans">
            {summary.weekly_self_care}
          </p>
        </div>
      </div>

    </div>
  );
};
