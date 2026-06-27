import React, { useState } from "react";
import { motion } from "motion/react";
import { DreamEntry } from "../types";
import { Sun, CloudSun, CloudRain, Cloud, Wind, Moon, Sparkles, CloudLightning, Heart, CheckCircle2, ArrowLeft, X } from "lucide-react";

interface InnerWeatherViewProps {
  dream: DreamEntry;
  onClose: () => void;
  onBackToCard: () => void;
}

const getWeatherIcon = (type: string) => {
  const iconClass = "w-16 h-16 transition-transform duration-500 animate-float";
  switch (type) {
    case "晴れ":
      return <Sun className={`${iconClass} text-amber-500`} />;
    case "薄曇り":
      return <CloudSun className={`${iconClass} text-indigo-400`} />;
    case "小雨":
      return <CloudRain className={`${iconClass} text-sky-500`} />;
    case "霧":
    case "濃霧":
      return <Cloud className={`${iconClass} text-slate-400`} />;
    case "風が強い":
      return <Wind className={`${iconClass} text-emerald-500`} />;
    case "夜明け前":
      return <Moon className={`${iconClass} text-indigo-500`} />;
    case "静かな雨":
      return <CloudRain className={`${iconClass} text-indigo-600`} />;
    case "柔らかい光":
      return <Sparkles className={`${iconClass} text-yellow-500`} />;
    case "嵐":
      return <CloudLightning className={`${iconClass} text-red-500`} />;
    default:
      return <Sun className={`${iconClass} text-amber-500`} />;
  }
};

const getWeatherPhrase = (type: string): string => {
  switch (type) {
    case "晴れ":
      return "あなたの心は、穏やかな温かさに包まれています。";
    case "薄曇り":
      return "急がなくても、失われないものがあります。";
    case "小雨":
      return "雨粒が土を潤すように、心に恵みを蓄えましょう。";
    case "霧":
    case "濃霧":
      return "先が見えないときは、足元の一歩だけを愛おしみましょう。";
    case "風が強い":
      return "変化の風は、不要なものをそっと吹き飛ばしてくれます。";
    case "夜明け前":
      return "もっとも深い闇のあとに、必ず新しい光が差し込みます。";
    case "静かな雨":
      return "静寂の中に身を浸し、心に染み入る音に耳を傾けましょう。";
    case "柔らかい光":
      return "あなたはただそこにいるだけで、十分に美しい存在です。";
    case "嵐":
      return "嵐はいつか必ず去ります。今は温かい場所で、ただ嵐が過ぎるのを待ちましょう。";
    default:
      return "今日のあなたが、すこやかでありますように。";
  }
};

export const InnerWeatherView: React.FC<InnerWeatherViewProps> = ({
  dream,
  onClose,
  onBackToCard
}) => {
  const [careAccepted, setCareAccepted] = useState(false);
  const analysis = dream.analysis;
  const weather = analysis.inner_weather;
  const care = analysis.self_care;

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-slate-900/5 overflow-hidden text-left text-slate-800">
      {/* Background Soft Lighting depending on weather type */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-indigo-200/10 blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-8 z-10">
        <button
          onClick={onBackToCard}
          className="flex items-center gap-1.5 text-xs text-[#77767d] hover:text-[#191c1d] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          夢カードに戻る
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative flex flex-col items-center text-center max-w-md mx-auto mb-8 z-10">
        {/* Animated Weather Icon Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center w-28 h-28 rounded-full bg-white/40 border border-white/60 mb-4 shadow-lg"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-md animate-pulse" />
          {getWeatherIcon(weather.type)}
        </motion.div>

        {/* Weather Title */}
        <span className="font-mono text-[9px] text-[#77767d] tracking-[0.2em] uppercase mb-1 font-semibold">
          TODAY'S INNER WEATHER
        </span>
        <h2 className="font-display text-2xl font-normal text-[#191c1d] tracking-wide mb-2">
          心の天気：{weather.type}
        </h2>
        
        {/* Weather Explanation phrase */}
        <p className="text-sm text-[#51647b] font-medium font-display mb-5 italic">
          「 {getWeatherPhrase(weather.type)} 」
        </p>

        {/* Detailed weather paragraph */}
        <p className="text-xs text-[#46464c] leading-relaxed bg-white/40 border border-white/50 p-5 rounded-2xl w-full">
          {weather.description}
        </p>
      </div>

      {/* Today's Self-care Panel */}
      <div className="relative border-t border-slate-200/20 pt-6 z-10">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4.5 h-4.5 text-red-500 shrink-0" />
          <h3 className="font-display text-base font-normal text-[#191c1d] tracking-wide">
            今日の小さなセルフケア提案
          </h3>
        </div>

        {/* Beautiful Lavender Self-care Container */}
        <div className="p-6 rounded-[28px] bg-[#e6e6fa]/35 border border-indigo-200/30 shadow-sm">
          <span className="bg-[#e6e6fa] text-[#5c5d6e] text-[9px] font-mono tracking-widest px-3.5 py-1 rounded-full uppercase inline-block font-semibold mb-3">
            DAILY SMALL CARE
          </span>
          
          <h4 className="text-lg font-normal text-[#191c1d] font-display mb-1.5">
            {care.action}
          </h4>
          <p className="text-xs text-[#46464c] leading-relaxed mb-5">
            {care.reason}
          </p>

          {/* Accept / Complete action button */}
          <button
            onClick={() => setCareAccepted(!careAccepted)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-xs tracking-wider transition-all cursor-pointer ${
              careAccepted 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10" 
                : "bg-white/60 hover:bg-white/80 border border-slate-200 text-[#46464c]"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 transition-transform ${careAccepted ? "scale-110 text-emerald-200" : ""}`} />
            {careAccepted ? "今日、このケアを実践中（タップで取り消し）" : "今日、これをやってみる"}
          </button>
        </div>
      </div>

      {/* Footer Branded Line */}
      <div className="relative mt-8 text-center border-t border-slate-200/20 pt-4 z-10">
        <span className="font-mono text-[8px] tracking-widest text-[#77767d] uppercase font-medium">
          心のインナーウェザー診断 • YUMEPO
        </span>
      </div>
    </div>
  );
};
