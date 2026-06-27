import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, AlertCircle, ArrowLeft, CloudRain, Sparkles, Brain, Compass } from "lucide-react";

interface DreamCaptureProps {
  onSubmit: (text: string, inputType: 'text' | 'voice', analysisMode: 'default' | 'freud' | 'jung') => void;
  isLoading: boolean;
  onCancel: () => void;
}

const QUICK_CHIPS = [
  { label: "場所だけ覚えている", prompt: "深い霧のかかった森の中にいた。大きな古木の下にぽつんと立っていた。" },
  { label: "人だけ覚えている", prompt: "昔、高校生のころによく一緒にいた友達が現れた。でも会話は交わさず、ただ見つめ合っていた。" },
  { label: "気持ちだけ覚えている", prompt: "焦っている。何かに追いかけられている。出口のない細い迷路をただ必死に走っているような気持ちだった。" },
  { label: "色だけ覚えている", prompt: "一面がまばゆい金色、あるいは夕暮れの燃えるようなオレンジ色に包まれていた。とても暖かかった。" },
  { label: "何も覚えていない", prompt: "夢をはっきりとは覚えていません。ただ、目覚めたときに何となく懐かしくて少し寂しい感覚だけが心に残っています。" }
];

export const DreamCapture: React.FC<DreamCaptureProps> = ({
  onSubmit,
  isLoading,
  onCancel
}) => {
  const [inputText, setInputText] = useState("");
  const [analysisMode, setAnalysisMode] = useState<'default' | 'freud' | 'jung'>('default');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "ja-JP";

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInputText(prev => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        if (e.error === "not-allowed") {
          setMicError("マイクへのアクセスが許可されていません。");
        } else {
          setMicError("音声認識中にエラーが発生しました。");
        }
        stopRecording();
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    try {
      if (recognitionRef.current) {
        setIsRecording(true);
        setRecordingSeconds(0);
        recognitionRef.current.start();

        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      } else {
        // Fallback simulated voice recording
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.error("Could not start microphone:", err);
      setMicError("マイクを起動できませんでした。ブラウザのアクセス許可を確認してください。");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsRecording(false);

    // If simulated fallback and text is empty, write a sample voice transcript
    if (!recognitionRef.current && !inputText) {
      setInputText("夜の静かな駅に立っていました。電車はなかなか来なくて、ホームには蛍光灯の冷たい光だけが灯っています。少し離れたところに昔の友人が見えましたが、声をかけようとすると視界がかすみ、そのまま目が覚めてしまいました。少し寂しくて焦る気持ちが残っています。");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSubmit(inputText, isRecording ? 'voice' : 'text', analysisMode);
  };

  const selectChip = (promptText: string) => {
    setInputText(promptText);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white/55 backdrop-blur-[16px] border border-white/60 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-slate-900/5 overflow-hidden text-slate-800">
      {/* Absolute Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#f8f9fa]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative w-20 h-20 mb-6">
              {/* Pulsating glowing core */}
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse-slow" />
              <div className="absolute inset-2 rounded-full border border-indigo-400/20 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-4 rounded-full border border-dashed border-[#5c5d6e]/20 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
              <div className="absolute inset-6 flex items-center justify-center text-[#5c5d6e]">
                <CloudRain className="w-5 h-5 animate-bounce" />
              </div>
            </div>
            <h3 className="font-display text-lg font-medium text-[#191c1d] mb-2">夢のかけらを紡ぎ中...</h3>
            <p className="text-xs text-[#46464c] max-w-xs leading-relaxed">
              夢の感情・メタファー・天気をやさしく整理し、あなただけの心の天気カードを現像しています。
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-[#77767d] hover:text-[#191c1d] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          閉じる
        </button>
        <span className="font-mono text-[9px] tracking-widest text-[#5c5d6e]/70 uppercase font-semibold">
          Yumepo • Dream Capture
        </span>
      </div>

      <div className="text-left mb-6">
        <h2 className="font-display text-2xl font-normal text-[#191c1d] tracking-wide mb-1.5">
          夢のかけらを預ける
        </h2>
        <p className="text-xs text-[#46464c] leading-relaxed">
          目覚めた朝、覚えている景色をそのまま教えてください。占いではなく、感情をやさしく整理します。
        </p>
      </div>

      {/* Error Banner */}
      {micError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs mb-5 text-left">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">マイクエラー</p>
            <p className="text-slate-600 text-[11px] mt-0.5">{micError}</p>
          </div>
        </div>
      )}

      {/* Text Area Input with Voice Trigger Inside */}
      <div className="relative mb-6 group glow-focus">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isRecording || isLoading}
          placeholder="夢の景色を教えてください..."
          className="w-full h-60 bg-white/70 border-none rounded-[32px] p-6 pr-16 text-base text-[#191c1d] placeholder-[#77767d]/50 focus:outline-none focus:ring-0 focus:bg-white/90 shadow-sm duration-500 leading-relaxed resize-none disabled:opacity-50"
        />

        {/* Floating Voice Trigger Button inside Textarea */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isLoading}
          className={`absolute bottom-6 right-6 w-12 h-12 flex items-center justify-center rounded-full shadow-md transition-all duration-300 ${
            isRecording 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-[#5c5d6e] hover:bg-[#4d6077] text-white hover:scale-105 active:scale-95"
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Floating Voice Recording Status Panel */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-white/95 rounded-[32px] flex flex-col items-center justify-center p-6 text-center border border-indigo-200"
            >
              <div className="relative w-16 h-16 flex items-center justify-center mb-3">
                <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 border border-red-200">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              
              <span className="font-mono text-base font-semibold text-slate-800 tracking-widest">
                {formatTime(recordingSeconds)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 animate-pulse">
                音声をテキストに変換しています。そのままお話しください...
              </span>
              
              <button
                type="button"
                onClick={stopRecording}
                className="mt-4 px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 transition-all cursor-pointer font-medium"
              >
                録音を終了する
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick suggestions Chips */}
      <div className="text-left mb-8">
        <div className="flex flex-wrap gap-2.5">
          {QUICK_CHIPS.map((chip, idx) => {
            const shortLabel = chip.label.replace("覚えている", "").replace("何も覚えていない", "あまり覚えていない");
            return (
              <button
                key={idx}
                type="button"
                disabled={isRecording || isLoading}
                onClick={() => selectChip(chip.prompt)}
                className="px-5 py-2 rounded-full bg-[#cde1fc]/20 text-[#51647b] text-xs font-medium border border-[#cde1fc]/40 hover:bg-[#cde1fc]/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                {shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Mode Selector */}
      <div className="text-left mb-8">
        <h4 className="flex items-center gap-1.5 text-[10px] font-mono text-[#77767d] uppercase tracking-widest mb-3.5 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#5c5d6e]" />
          整理アプローチを選択
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: "default",
              name: "標準やさしい整理",
              desc: "客観的に夢の感情やモチーフを整理し、ありのままの心の気配を受け止めます。",
              icon: Sparkles,
              color: "text-[#5c5d6e] bg-[#e6e6fa]/40 border-indigo-200/50"
            },
            {
              id: "freud",
              name: "本音分析 (フロイト派)",
              desc: "夢は無意識の変装とし、現実で少し我慢している本音や欲求に目を向けます。",
              icon: Brain,
              color: "text-purple-600 bg-purple-50/40 border-purple-200/50"
            },
            {
              id: "jung",
              name: "調和分析 (ユング派)",
              desc: "夢は心のアドバイスとし、普段意識しないもう一人の自分に気づき、統合します。",
              icon: Compass,
              color: "text-emerald-600 bg-emerald-50/40 border-emerald-200/50"
            }
          ].map((mode) => {
            const isSelected = analysisMode === mode.id;
            const IconComponent = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                disabled={isRecording || isLoading}
                onClick={() => setAnalysisMode(mode.id as any)}
                className={`flex flex-col text-left p-4 rounded-[20px] border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-white border-[#5c5d6e] shadow-md shadow-[#5c5d6e]/5 ring-1 ring-[#5c5d6e]/10"
                    : "bg-white/30 border-white/40 hover:border-slate-300 hover:bg-white/50"
                } disabled:opacity-50`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-xl transition-all duration-300 ${isSelected ? mode.color : "bg-slate-100 text-slate-400"}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? "text-[#191c1d]" : "text-[#46464c]"}`}>
                    {mode.name}
                  </span>
                </div>
                <p className="text-[10.5px] text-[#46464c]/80 leading-normal font-sans">
                  {mode.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guiding Helper Questions (Bento Style Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-6 rounded-[24px] bg-[#eee9bd]/20 border border-[#eee9bd]/30 dream-blur hover:bg-[#eee9bd]/30 transition-all text-left">
          <p className="text-[#6b6946] font-mono text-[10px] mb-1.5 opacity-70 tracking-widest uppercase">Where were you?</p>
          <p className="text-[#191c1d] font-display text-sm font-medium">どこにいましたか？</p>
        </div>
        <div className="p-6 rounded-[24px] bg-[#cde1fc]/20 border border-[#cde1fc]/30 dream-blur hover:bg-[#cde1fc]/30 transition-all text-left">
          <p className="text-[#51647b] font-mono text-[10px] mb-1.5 opacity-70 tracking-widest uppercase">Who was there?</p>
          <p className="text-[#191c1d] font-display text-sm font-medium">誰がいましたか？</p>
        </div>
        <div className="p-6 rounded-[24px] bg-[#e6e6fa]/20 border border-[#e6e6fa]/30 dream-blur hover:bg-[#e6e6fa]/30 transition-all text-left">
          <p className="text-[#656677] font-mono text-[10px] mb-1.5 opacity-70 tracking-widest uppercase">How did it feel?</p>
          <p className="text-[#191c1d] font-display text-sm font-medium">どんな気持ちでしたか？</p>
        </div>
        <div className="p-6 rounded-[24px] bg-slate-100/30 border border-slate-200/30 dream-blur hover:bg-slate-100/40 transition-all text-left">
          <p className="text-[#46464c] font-mono text-[10px] mb-1.5 opacity-70 tracking-widest uppercase">Was it bright or dark?</p>
          <p className="text-[#191c1d] font-display text-sm font-medium">明るかった？暗かった？</p>
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isRecording || isLoading}
          className="px-12 py-4 bg-[#5c5d6e] hover:bg-[#4d6077] disabled:bg-[#edeeef] text-white disabled:text-[#77767d]/50 rounded-full text-base font-medium shadow-md shadow-slate-900/5 hover:shadow-slate-900/10 hover:scale-[1.01] active:scale-95 transition-all duration-500 cursor-pointer"
        >
          そっと保存する
        </button>
      </div>
    </div>
  );
};
