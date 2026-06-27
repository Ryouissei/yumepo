import React from "react";
import { motion } from "motion/react";
import { Sparkles, ChevronDown } from "lucide-react";
import { LogoIcon } from "./LogoIcon";

interface SplashProps {
  onEnter: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-dawn-gradient font-sans select-none px-6">
      {/* Subtle Background Shader for Atmosphere */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,_rgba(230,230,250,0.5)_0%,_transparent_70%)]" />

      {/* Floating orbs for cosmic/dream atmosphere */}
      <div className="absolute top-[20%] left-[15%] w-64 h-64 bg-indigo-200/20 rounded-full blur-[100px] animate-float" style={{ animationDuration: "10s" }} />
      <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-yellow-200/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "-3s", animationDuration: "12s" }} />

      <div className="relative max-w-lg w-full flex flex-col items-center text-center z-10">
        {/* Evocative Lunar Emblem / Mailbox Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center w-24 h-24 rounded-[28px] bg-white border border-indigo-200/20 shadow-xl mb-6 p-1 overflow-hidden"
        >
          <LogoIcon size={76} />
        </motion.div>

        {/* Branding Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="font-logo text-4xl font-bold tracking-wider text-[#5c5d6e] mb-2">
            Yumepo
          </h1>
        </motion.div>

        {/* Poetry copy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-12 max-w-xs mx-auto"
        >
          <p className="font-sans text-sm font-medium tracking-wide text-[#5c5d6e]/90 leading-relaxed">
            夢守りが、夜に預けたあなたの夢をそっと紐解きます。
          </p>
        </motion.div>

        {/* Start Button CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button
            onClick={onEnter}
            className="group relative flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            {/* Button Background with Glassmorphism */}
            <div className="w-16 h-16 rounded-full bg-white border border-indigo-200/20 flex items-center justify-center shadow-md transition-colors duration-300 group-hover:bg-indigo-50/50">
              <ChevronDown className="w-6 h-6 text-[#5c5d6e] transition-transform duration-300" />
            </div>
            <span className="mt-3.5 font-sans text-xs font-semibold tracking-wider text-[#5c5d6e]">
              夢のトビラを開ける
            </span>
          </button>
        </motion.div>
      </div>

      {/* Subtle branding signature in the margin */}
      <div className="absolute bottom-6 font-mono text-[8px] tracking-widest text-[#77767d] uppercase">
        © 2026 YUMEPO • PERSONAL REFLECTION
      </div>
    </div>
  );
};
