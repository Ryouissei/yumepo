import React from "react";
import { motion } from "motion/react";
import { DreamAnalysis, DreamEntry } from "../types";
import { DreamCanvas } from "./DreamCanvas";
import { Eye, ShieldAlert, Sparkles, AlertCircle, Compass, Heart, HelpCircle, ArrowRight, X, Brain } from "lucide-react";

const STYLE_NAMES: { [key: string]: string } = {
  watercolor: "淡く滲む水彩画風",
  clay_3d: "ミニマルなパステル3D風",
  starry_fantasy: "夜空のファンタジーアート風",
  retro_anime: "レトロなアニメ・ジブリ風",
  surreal_collage: "シュールレアリスムのコラージュ風",
};

interface DreamCardProps {
  dream: DreamEntry;
  onClose: () => void;
  onViewWeather: () => void;
}

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  onClose,
  onViewWeather
}) => {
  const analysis = dream.analysis;
  const isSafetyMode = analysis.risk_level === 'high';

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-slate-900/5 overflow-hidden text-left text-slate-800">
      {/* Background soft lighting */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-indigo-200/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-yellow-100/10 blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/20">
        <div className="flex flex-wrap items-center gap-2">
          {isSafetyMode ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-mono font-medium animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              SAFETY MODE ACTIVE
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6e6fa]/40 border border-indigo-200/30 text-[#5c5d6e] text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                DREAM PRINT DEVELOPED
              </div>
              {dream.analysis_mode && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${
                  dream.analysis_mode === "freud"
                    ? "bg-purple-50/40 border-purple-200/30 text-purple-700"
                    : dream.analysis_mode === "jung"
                    ? "bg-emerald-50/40 border-emerald-200/30 text-emerald-700"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                }`}>
                  {dream.analysis_mode === "freud" ? (
                    <Brain className="w-3 h-3 text-purple-600" />
                  ) : dream.analysis_mode === "jung" ? (
                    <Compass className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-[#5c5d6e]" />
                  )}
                  <span>
                    {dream.analysis_mode === "freud"
                      ? "フロイト派本音分析"
                      : dream.analysis_mode === "jung"
                      ? "ユング派調和分析"
                      : "標準分析"}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isSafetyMode ? (
        /* Safety Grounding Flow */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Support Graphic / Left Column */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-red-50/50 border border-red-200 rounded-[28px] text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-medium text-[#ba1a1a] mb-2">
              心が少しお疲れかもしれません
            </h3>
            <p className="text-xs text-[#46464c] leading-relaxed">
              この夢は少し負荷が高そうです。今は夢の意味を深く分析するより、現実の温もりや安全を優先しましょう。
            </p>
          </div>

          {/* Calming Exercises / Right Column */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-normal text-[#191c1d] mb-2 tracking-wide">
                穏やかな現実に戻るためのケア
              </h2>
              <p className="text-sm text-[#46464c] leading-relaxed">
                あなたは一人で抱えなくて大丈夫です。まずは深く息を吐き出し、今いる安心な部屋の感覚に意識を戻しましょう。
              </p>
            </div>

            {/* 5-4-3-2-1 Grounding steps */}
            <div className="p-5 bg-white/40 border border-slate-200/30 rounded-[24px] space-y-3">
              <h4 className="text-xs font-semibold text-[#5c5d6e] uppercase tracking-wide">
                現実とつながるグラウンディング・アクション
              </h4>
              <ul className="space-y-2.5 text-xs text-[#46464c]">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6e6fa]/50 text-[#5c5d6e] font-mono font-bold text-[10px]">3</span>
                  <span>近くに見える、安定した静かなものを <strong>3つ</strong> 数える (例: 机、コップ、時計など)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6e6fa]/50 text-[#5c5d6e] font-mono font-bold text-[10px]">2</span>
                  <span>手や肌で触れられる <strong>2つの感触</strong> をじっくり確かめる (例: 暖かい衣類、冷たい水、太ももの温かさなど)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6e6fa]/50 text-[#5c5d6e] font-mono font-bold text-[10px]">1</span>
                  <span>今聞こえてくる身の回りの音を <strong>1つ</strong> 静かに聴いてみる (例: 風の音、空調、遠くの車の音など)</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-[20px] bg-[#e6e6fa]/20 border border-[#e6e6fa]/30 text-xs text-[#46464c] leading-relaxed">
              <span className="font-semibold block mb-0.5 text-[#5c5d6e]">お勧めのアドバイス</span>
              温かい白湯を一口ずつゆっくり飲んだり、首や肩をゆっくり回してみてください。あなたの心は、安全に守られています。
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-200/10">
              <button
                onClick={onViewWeather}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5c5d6e] hover:bg-[#4d6077] text-white font-medium text-xs tracking-widest transition-all cursor-pointer shadow-md shadow-[#5c5d6e]/5"
              >
                今日のアドバイスを見る
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/40 hover:bg-white/60 border border-slate-200 text-xs font-medium text-[#46464c] text-center transition-all cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Detailed Dream Card */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Abstract Canvas or Generated Image / Left Column */}
          <div className="lg:col-span-5 space-y-4">
            {analysis.illustration_url ? (
              <div className="relative group overflow-hidden rounded-[28px] bg-slate-950 border border-white/40 shadow-lg">
                <img
                  src={analysis.illustration_url}
                  alt={analysis.dream_title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto aspect-square object-cover duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Style badge overlay */}
                {analysis.illustration_style && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/40 shadow-sm flex items-center justify-between pointer-events-auto">
                    <div>
                      <span className="block text-[8px] font-mono text-[#77767d] uppercase tracking-wider">アートスタイル</span>
                      <span className="text-[11px] font-semibold text-slate-800">
                        {STYLE_NAMES[analysis.illustration_style] || analysis.illustration_style}
                      </span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/40 border border-white/50 rounded-[28px] overflow-hidden p-4 shadow-sm flex justify-center">
                <DreamCanvas
                  colors={analysis.colors}
                  emotions={analysis.emotions}
                  motifs={analysis.motifs}
                  width={360}
                  height={360}
                />
              </div>
            )}

            {/* Prompt details or colors */}
            {analysis.illustration_prompt ? (
              <div className="p-4 bg-white/40 rounded-2xl border border-white/40 space-y-1.5 text-left">
                <span className="block text-[9px] text-[#77767d] font-mono uppercase tracking-widest font-semibold">生成プロンプト (AI Interpretation)</span>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed italic">
                  "{analysis.illustration_prompt}"
                </p>
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/20">
                  <span className="text-[10px] text-[#77767d] font-mono uppercase tracking-wider mr-1">色の気配:</span>
                  {analysis.colors.map((color, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-[10px] text-[#46464c] font-medium">{color}</span>
                      {idx < analysis.colors.length - 1 && <span className="text-slate-300">•</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Color swatches rendering */
              <div className="flex items-center gap-1.5 justify-center py-2 bg-white/30 rounded-2xl border border-white/40">
                <span className="text-[10px] text-[#77767d] font-mono uppercase tracking-wider mr-1">色の気配:</span>
                {analysis.colors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-[11px] text-[#46464c] font-medium">{color}</span>
                    {idx < analysis.colors.length - 1 && <span className="text-slate-300">•</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dream Structure details / Right Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="font-mono text-[9px] text-[#77767d] tracking-widest block uppercase mb-1">夢のタイトル</span>
              <h2 className="font-display text-2xl font-normal text-[#191c1d] tracking-wide">
                {analysis.dream_title}
              </h2>
              
              <span className="font-mono text-[9px] text-[#77767d] tracking-widest block uppercase mt-4 mb-1">あらすじ</span>
              <p className="text-sm text-[#46464c] leading-relaxed bg-white/40 border border-white/50 p-4 rounded-2xl italic">
                {analysis.summary}
              </p>
            </div>

            {/* Places and Characters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/40 rounded-2xl border border-white/50">
                <span className="block text-[10px] text-[#77767d] font-mono uppercase tracking-wider mb-1">現れた場所</span>
                <span className="text-xs text-[#191c1d] font-medium">
                  {analysis.places.length > 0 ? analysis.places.join(", ") : "明確な場所はなし"}
                </span>
              </div>
              <div className="p-4 bg-white/40 rounded-2xl border border-white/50">
                <span className="block text-[10px] text-[#77767d] font-mono uppercase tracking-wider mb-1">登場人物</span>
                <span className="text-xs text-[#191c1d] font-medium">
                  {analysis.characters.length > 0 ? analysis.characters.join(", ") : "明確な登場人物はなし"}
                </span>
              </div>
            </div>

            {/* Tags (emotions & motifs) */}
            <div className="space-y-3.5">
              <div>
                <span className="block text-[10px] text-[#77767d] font-mono uppercase tracking-wider mb-2">浮かび上がった感情</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.emotions.map((emo, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#e6e6fa]/40 border border-indigo-200/30 text-[#656677] font-medium"
                    >
                      {emo}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] text-[#77767d] font-mono uppercase tracking-wider mb-2">主要なモチーフ</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.motifs.map((motif, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-3.5 py-1.5 rounded-full bg-slate-100/60 border border-slate-200/20 text-[#46464c]"
                    >
                      {motif}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metaphor and Deep Questions */}
            <div className="space-y-4 pt-4 border-t border-slate-200/10">
              <div className="flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-[#5c5d6e] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-[#77767d] font-mono uppercase tracking-wider">夢のメタファー</span>
                  <p className="text-xs text-[#46464c] mt-1 leading-relaxed">
                    {analysis.metaphor}
                  </p>
                </div>
              </div>

              {/* Reflection Box (Stunning Yellow-Tinted Container) */}
              <div className="flex items-start gap-3 p-5 bg-[#eee9bd]/25 border border-[#eee9bd]/30 rounded-[24px]">
                <HelpCircle className="w-4.5 h-4.5 text-[#6b6946] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-[#6b6946] font-mono uppercase tracking-wider font-semibold">今日の問い</span>
                  <p className="text-base font-display font-normal text-[#191c1d] mt-1.5 leading-relaxed italic tracking-wide">
                    「 {analysis.reflection_question} 」
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-200/10">
              <button
                onClick={onViewWeather}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5c5d6e] hover:bg-[#4d6077] text-white font-medium text-xs tracking-widest transition-all cursor-pointer shadow-md shadow-[#5c5d6e]/5 hover:scale-105 active:scale-95 duration-300"
              >
                今日の心の天気とセルフケアを見る
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/40 hover:bg-white/60 border border-slate-200 text-xs font-medium text-[#46464c] text-center transition-all cursor-pointer hover:scale-105 active:scale-95 duration-300"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
