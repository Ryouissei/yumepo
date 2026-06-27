import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DreamEntry, GardenObject } from "./types";
import { Splash } from "./components/Splash";
import { DreamCapture } from "./components/DreamCapture";
import { DreamCard } from "./components/DreamCard";
import { InnerWeatherView } from "./components/InnerWeatherView";
import { GardenCanvas } from "./components/GardenCanvas";
import { WeeklyReviewView } from "./components/WeeklyReviewView";
import { LogoIcon } from "./components/LogoIcon";
import { 
  Trees, 
  Compass, 
  Moon, 
  Calendar, 
  Heart, 
  CloudSun, 
  FileText, 
  History, 
  X, 
  BookOpen, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Info,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "garden" | "weekly" | "history">("home");
  const [showSplash, setShowSplash] = useState(true);
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [gardenObjects, setGardenObjects] = useState<GardenObject[]>([]);
  
  // Navigation states
  const [currentView, setCurrentView] = useState<"dashboard" | "capture" | "card" | "weather">("dashboard");
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  
  // Interaction loading
  const [isLoadingDream, setIsLoadingDream] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Load initial data
  const fetchData = async () => {
    try {
      const dreamsRes = await fetch("/api/dreams");
      const gardenRes = await fetch("/api/garden");
      
      if (dreamsRes.ok && gardenRes.ok) {
        const dreamsData = await dreamsRes.json();
        const gardenData = await gardenRes.json();
        setDreams(dreamsData);
        setGardenObjects(gardenData);
      }
    } catch (err) {
      console.error("Error loading application state:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format today's date in Japanese
  const getFormattedDate = () => {
    const today = new Date();
    const days = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const day = days[today.getDay()];
    return `${year}年${month}月${date}日 ${day}`;
  };

  // Handle dream submission
  const handleCaptureSubmit = async (rawInput: string, inputType: 'text' | 'voice', analysisMode: 'default' | 'freud' | 'jung') => {
    setIsLoadingDream(true);
    setErrorText(null);
    try {
      const response = await fetch("/api/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_input: rawInput, input_type: inputType, analysis_mode: analysisMode })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "夢の解析中にエラーが発生しました。");
      }

      const newDream: DreamEntry = await response.json();
      
      // Update local state
      setDreams(prev => [newDream, ...prev]);
      setSelectedDream(newDream);
      
      // Refresh entire database state to sync recalculations
      await fetchData();

      // Show the dream card view
      setCurrentView("card");
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "夢の送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoadingDream(false);
    }
  };

  // Delete a specific dream card
  const handleDeleteDream = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("この夢カードを削除してもよろしいですか？（紐づく庭のデータも自動的に再計算されます）")) {
      return;
    }
    try {
      const response = await fetch(`/api/dreams/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        // Refresh state
        await fetchData();
        if (selectedDream?.dream_id === id) {
          setSelectedDream(null);
          setCurrentView("dashboard");
        }
      } else {
        alert("削除に失敗しました。");
      }
    } catch (err) {
      console.error("Error deleting dream:", err);
    }
  };

  // Reset database completely
  const handleResetDatabase = async () => {
    if (!window.confirm("これまでの夢ログと夢の庭をすべてクリアして初期状態に戻します。本当によろしいですか？")) {
      return;
    }
    try {
      const response = await fetch("/api/dreams/clear-all", {
        method: "POST"
      });
      if (response.ok) {
        setDreams([]);
        setGardenObjects([]);
        setSelectedDream(null);
        setCurrentView("dashboard");
        alert("夢ログをすべてクリアしました。");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDream = (dream: DreamEntry) => {
    setSelectedDream(dream);
    setCurrentView("card");
  };

  if (showSplash) {
    return <Splash onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen w-full bg-dawn-vertical text-slate-800 font-sans pb-28 overflow-x-hidden relative selection:bg-indigo-100/50">
      {/* Immersive Atmospheric Light Overlays */}
      <div className="absolute top-0 right-10 w-[300px] h-[300px] rounded-full bg-indigo-200/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[30%] left-[-100px] w-[350px] h-[350px] rounded-full bg-purple-100/10 blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "4s" }} />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-6 sm:pt-10">
        
        {/* Universal Sticky Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200/60 shadow-md overflow-hidden p-0.5">
              <LogoIcon size={44} />
            </div>
            <div className="text-left">
              <h1 className="font-logo text-xl font-bold tracking-normal text-[#191c1d]">Yumepo</h1>
              <span className="text-[9px] text-[#77767d] tracking-wide font-semibold">夢の心象気象計</span>
            </div>
          </div>

          {/* Date and Reset Panel */}
          <div className="flex items-center gap-4 text-xs font-medium text-[#77767d]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 border border-white">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{getFormattedDate()}</span>
            </div>
            <button
              onClick={handleResetDatabase}
              className="text-[9px] font-mono font-semibold text-[#77767d] hover:text-red-500 border border-transparent px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              title="初期状態に戻す"
            >
              RESET DATA
            </button>
          </div>
        </header>

        {/* Inner Error banner */}
        {errorText && (
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl mb-6 text-left shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>{errorText}</span>
            </div>
            <button onClick={() => setErrorText(null)} className="text-slate-400 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Views Rendering based on flow */}
        <main className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {currentView === "capture" && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
              >
                <DreamCapture
                  onSubmit={handleCaptureSubmit}
                  isLoading={isLoadingDream}
                  onCancel={() => setCurrentView("dashboard")}
                />
              </motion.div>
            )}

            {currentView === "card" && selectedDream && (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
              >
                <DreamCard
                  dream={selectedDream}
                  onClose={() => {
                    setSelectedDream(null);
                    setCurrentView("dashboard");
                  }}
                  onViewWeather={() => setCurrentView("weather")}
                />
              </motion.div>
            )}

            {currentView === "weather" && selectedDream && (
              <motion.div
                key="weather"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
              >
                <InnerWeatherView
                  dream={selectedDream}
                  onClose={() => {
                    setSelectedDream(null);
                    setCurrentView("dashboard");
                  }}
                  onBackToCard={() => setCurrentView("card")}
                />
              </motion.div>
            )}

            {currentView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                
                {/* Tab Views */}
                <div className="mt-2">
                  {/* TAB 1: HOME PANEL */}
                  {activeTab === "home" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left: Capture Action card */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* Immersive CTA Capture Trigger Card */}
                        <div className="p-8 bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] text-left relative overflow-hidden group shadow-lg shadow-slate-900/5">
                          {/* Inner soft sphere glow */}
                          <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-[#e6e6fa]/20 blur-[50px] pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                          
                          <div className="flex items-start gap-4 mb-6">
                            <div className="p-3.5 bg-[#e6e6fa]/50 border border-indigo-200/30 rounded-2xl text-[#5c5d6e]">
                              <Moon className="w-6 h-6 animate-float" />
                            </div>
                            <div>
                              <h3 className="font-display text-xl font-light text-[#191c1d] tracking-wide mb-1.5">覚えている朝の夢を、預ける</h3>
                              <p className="text-xs text-[#46464c] leading-relaxed">
                                「夢は、心が夜に残したメモである。」<br />
                                覚えている断片を言葉にして、あなたの内面の声に耳を傾けてみませんか。
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setCurrentView("capture")}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5c5d6e] text-white hover:bg-[#4d6077] font-semibold text-xs tracking-widest shadow-md shadow-[#5c5d6e]/5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                          >
                            夢のかけらを預ける
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Recent weather spotlight if available */}
                        {dreams.length > 0 && dreams[0].analysis?.inner_weather && (
                          <div 
                            onClick={() => handleOpenDream(dreams[0])}
                            className="p-5 bg-white/55 border border-white/60 backdrop-blur-sm rounded-[24px] text-left flex items-center justify-between hover:bg-white/85 cursor-pointer transition-all shadow-md shadow-slate-900/5"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 bg-[#e6e6fa]/40 rounded-xl text-[#5c5d6e]">
                                <CloudSun className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-[#191c1d] block mt-0.5">
                                  最新の心の天気：{dreams[0].analysis.inner_weather.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[#5c5d6e] font-semibold">
                              カードを見る
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        )}

                        {/* Concept Philosophy / About widget */}
                        <div className="p-6 rounded-[32px] bg-white/55 border border-white/60 shadow-lg shadow-slate-900/5 text-left text-xs leading-relaxed text-[#46464c] space-y-2.5">
                          <h4 className="font-semibold text-[#191c1d] flex items-center gap-1.5 text-xs tracking-wider">
                            <Info className="w-4 h-4 text-[#5c5d6e]" />
                            Yumepo のコンセプト
                          </h4>
                          <p>
                            私たちの心は、言葉にできない感情や日々の疲れを夢という「メタファー」に変えて夜の間に整理しています。
                          </p>
                          <p>
                            Yumepoは、夢の吉凶を断定する夢占いではありません。あなたから預かった夢のかけらを、やさしく解きほぐし、今日の自分を少し大切に扱うための小さなきっかけ（心の天気・セルフケア行動）を提供する、パーソナルな内省ツールです。
                          </p>
                        </div>
                      </div>

                      {/* Right: Latest Dream card or empty banner */}
                      <div className="lg:col-span-5 text-left space-y-6">
                        <span className="text-xs text-[#77767d] font-semibold block">最近の記録</span>
                        
                        {dreams.length > 0 ? (
                          <div 
                            onClick={() => handleOpenDream(dreams[0])}
                            className="group relative cursor-pointer bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] p-5 hover:border-slate-300 shadow-lg shadow-slate-900/5 transition-all duration-300 overflow-hidden"
                          >
                            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-[#e6e6fa]/50 to-[#eee9bd]/40 overflow-hidden mb-4 border border-indigo-100/50 flex items-center justify-center relative">
                              <div className="absolute top-2.5 right-2.5 z-10 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded text-[8px] font-mono text-[#5c5d6e] font-semibold border border-white uppercase">
                                {dreams[0].analysis.inner_weather.type}
                              </div>
                              <Moon className="w-10 h-10 text-[#5c5d6e]/40 animate-pulse" />
                            </div>

                            <span className="block text-[9px] font-mono text-[#5c5d6e] font-semibold uppercase">
                              {new Date(dreams[0].created_at).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })} の夢
                            </span>
                            <h4 className="text-base font-normal text-[#191c1d] group-hover:text-[#5c5d6e] mt-1 transition-colors font-display">
                              {dreams[0].analysis.dream_title}
                            </h4>
                            <p className="text-xs text-[#46464c] mt-1.5 leading-relaxed line-clamp-2">
                              {dreams[0].analysis.summary}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-3.5">
                              {dreams[0].analysis.emotions.slice(0, 2).map((emo, idx) => (
                                <span key={idx} className="text-[9.5px] px-2.5 py-1 rounded-full bg-[#e6e6fa]/40 text-[#656677] border border-indigo-200/30 font-medium">
                                  {emo}
                                </span>
                              ))}
                              {dreams[0].analysis.motifs.slice(0, 2).map((mot, idx) => (
                                <span key={idx} className="text-[9.5px] px-2.5 py-1 rounded-full bg-slate-100/60 text-[#46464c] border border-slate-200/20">
                                  {mot}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 bg-white/55 border border-dashed border-slate-200/60 rounded-[32px] text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
                            <BookOpen className="w-10 h-10 text-slate-400 mb-3" />
                            <h4 className="font-display text-sm font-semibold text-[#46464c]">まだ夢の記録がありません</h4>
                            <p className="text-xs text-[#77767d] max-w-xs mt-1 leading-relaxed">
                              朝起きて覚えている夢のかけらを預けてみましょう。ここにあなただけの夢カードが生成されます。
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 2: DREAM GARDEN */}
                  {activeTab === "garden" && (
                    <div className="space-y-6 text-left">
                      <div>
                        <h2 className="font-display text-2xl font-light text-[#191c1d] mb-1.5 tracking-wide">夢の庭</h2>
                        <p className="text-xs text-[#46464c] max-w-xl leading-relaxed">
                          夢のモチーフが集まり、あなたの内面の変化を表す美しい庭が育ちます。
                        </p>
                      </div>

                      <GardenCanvas
                        gardenObjects={gardenObjects}
                        dreams={dreams}
                        onSelectDream={handleOpenDream}
                      />
                    </div>
                  )}

                  {/* TAB 3: WEEKLY REVIEW */}
                  {activeTab === "weekly" && (
                    <div className="space-y-4">
                      <div className="text-left">
                        <h2 className="font-display text-2xl font-light text-[#191c1d] mb-1.5 tracking-wide">週間まとめ</h2>
                        <p className="text-xs text-[#46464c] max-w-xl leading-relaxed">
                          過去7日間の心の天気の推移や感情傾向を分析し、来週のセルフケアに向けたアドバイスを生成します。
                        </p>
                      </div>

                      <WeeklyReviewView onSelectDream={handleOpenDream} />
                    </div>
                  )}

                  {/* TAB 4: HISTORY CARDS */}
                  {activeTab === "history" && (
                    <div className="space-y-6 text-left">
                      <div>
                        <h2 className="font-display text-2xl font-light text-[#191c1d] mb-1.5 tracking-wide">夢カード歴史</h2>
                        <p className="text-xs text-[#46464c] max-w-xl leading-relaxed">
                          これまでに集めたすべての夢カードです。いつでも心の天気やセルフケアを読み返せます。
                        </p>
                      </div>

                      {dreams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {dreams.map((dream) => (
                            <div
                              key={dream.dream_id}
                              onClick={() => handleOpenDream(dream)}
                              className="group bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] p-5 hover:border-slate-300 cursor-pointer transition-all flex flex-col justify-between shadow-lg shadow-slate-900/5"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/20">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[9px] text-[#5c5d6e] font-semibold">
                                      {new Date(dream.created_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                                    </span>
                                    {dream.analysis_mode && (
                                      <span className={`text-[8px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider ${
                                        dream.analysis_mode === "freud"
                                          ? "bg-[#e6e6fa] border-indigo-200/30 text-[#5c5d6e]"
                                          : dream.analysis_mode === "jung"
                                          ? "bg-[#eee9bd] border-[#eee9bd]/50 text-[#715d2a]"
                                          : "bg-slate-100 border-slate-200 text-[#46464c]"
                                      }`}>
                                        {dream.analysis_mode === "freud" ? "フロイト派" : dream.analysis_mode === "jung" ? "ユング派" : "標準"}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => handleDeleteDream(dream.dream_id, e)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                    title="削除する"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {dream.analysis.illustration_url && (
                                  <div className="mb-3.5 overflow-hidden rounded-[20px] border border-white/20 aspect-video bg-slate-950 shadow-sm">
                                    <img
                                      src={dream.analysis.illustration_url}
                                      alt={dream.analysis.dream_title}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover group-hover:scale-105 duration-700 ease-out"
                                    />
                                  </div>
                                )}

                                <h4 className="text-sm font-semibold text-[#191c1d] group-hover:text-[#5c5d6e] transition-colors truncate">
                                  {dream.analysis.dream_title}
                                </h4>
                                <p className="text-xs text-[#46464c] mt-2 line-clamp-3 leading-relaxed">
                                  {dream.analysis.summary}
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-200/20 flex items-center justify-between">
                                <span className="text-[10px] text-[#77767d]">
                                  天気: <strong className="text-[#191c1d] font-semibold">{dream.analysis.inner_weather.type}</strong>
                                </span>
                                <span className="text-[9px] font-mono text-[#5c5d6e] tracking-wider font-semibold uppercase group-hover:translate-x-0.5 transition-transform">
                                  OPEN CARD →
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 bg-white/55 border border-dashed border-slate-200/60 rounded-[32px] text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
                          <History className="w-10 h-10 text-slate-400 mb-3" />
                          <h4 className="font-display text-sm font-semibold text-[#46464c]">保存された夢はまだありません</h4>
                          <p className="text-xs text-[#77767d] max-w-xs mt-1 leading-relaxed">
                            新しく夢を預けて解析すると、自動的にここにアーカイブログとして蓄積されていきます。
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Bottom Navigation - Floating bar aesthetic */}
        {currentView === "dashboard" && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/65 border border-white/80 backdrop-blur-[18px] rounded-full shadow-2xl z-40 p-2 flex items-center justify-between gap-1.5">
            <button
              onClick={() => {
                setActiveTab("home");
                setCurrentView("dashboard");
              }}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === "home" ? "bg-[#5c5d6e] text-white font-semibold shadow-md shadow-[#5c5d6e]/10" : "text-[#77767d] hover:text-[#191c1d] hover:bg-white/40"
              }`}
            >
              <Moon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] tracking-wider font-semibold">夢守り</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("garden");
                setCurrentView("dashboard");
              }}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === "garden" ? "bg-[#5c5d6e] text-white font-semibold shadow-md shadow-[#5c5d6e]/10" : "text-[#77767d] hover:text-[#191c1d] hover:bg-white/40"
              }`}
            >
              <Trees className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] tracking-wider font-semibold">夢の庭</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("weekly");
                setCurrentView("dashboard");
              }}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === "weekly" ? "bg-[#5c5d6e] text-white font-semibold shadow-md shadow-[#5c5d6e]/10" : "text-[#77767d] hover:text-[#191c1d] hover:bg-white/40"
              }`}
            >
              <FileText className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] tracking-wider font-semibold">まとめ</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("history");
                setCurrentView("dashboard");
              }}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === "history" ? "bg-[#5c5d6e] text-white font-semibold shadow-md shadow-[#5c5d6e]/10" : "text-[#77767d] hover:text-[#191c1d] hover:bg-white/40"
              }`}
            >
              <History className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] tracking-wider font-semibold">夢カード</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
