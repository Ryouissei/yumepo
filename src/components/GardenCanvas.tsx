import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GardenObject, DreamEntry } from "../types";
import { Trees, Compass, Sparkles, Footprints, ArrowRight, X, Calendar, CloudSun } from "lucide-react";

interface GardenCanvasProps {
  gardenObjects: GardenObject[];
  dreams: DreamEntry[];
  onSelectDream: (dream: DreamEntry) => void;
}

// Stably determine positions for garden nodes based on their IDs/names so they stay in place
const getNodePosition = (name: string, index: number, total: number) => {
  if (total === 1) return { x: 50, y: 50 };
  
  // Use a deterministic seed from the name string
  let seed = 0;
  for (let i = 0; i < name.length; i++) {
    seed += name.charCodeAt(i);
  }
  
  // Distribute nodes roughly in a golden-ratio spiral or beautiful circle with some jitter
  const angle = (index * 2.39996) + (seed * 0.05); // golden angle in radians + seed jitter
  const radius = 15 + 25 * Math.sqrt(index / (total || 1)); // distribute outward
  
  // Keep values bounded between 15% and 85% to ensure they don't clip borders
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);
  
  return {
    x: Math.min(85, Math.max(15, x)),
    y: Math.min(85, Math.max(15, y))
  };
};

export const GardenCanvas: React.FC<GardenCanvasProps> = ({
  gardenObjects = [],
  dreams = [],
  onSelectDream
}) => {
  const [selectedNode, setSelectedNode] = useState<GardenObject | null>(null);

  // Compute node coordinate mapping
  const nodes = useMemo(() => {
    return gardenObjects.map((obj, index) => {
      const pos = getNodePosition(obj.name, index, gardenObjects.length);
      return {
        ...obj,
        x: pos.x,
        y: pos.y
      };
    });
  }, [gardenObjects]);

  // Find connections (lines) between nodes that share emotions or motifs
  const connections = useMemo(() => {
    const lines: Array<{ from: typeof nodes[0]; to: typeof nodes[0]; strength: number }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        // Count shared motifs
        const sharedMotifs = nodeA.related_motifs.filter(m => nodeB.related_motifs.includes(m));
        // Count shared emotions
        const sharedEmotions = nodeA.related_emotions.filter(e => nodeB.related_emotions.includes(e));
        
        const strength = sharedMotifs.length * 2 + sharedEmotions.length;
        if (strength > 0) {
          lines.push({ from: nodeA, to: nodeB, strength });
        }
      }
    }
    return lines;
  }, [nodes]);

  // Find dreams related to the selected garden object
  const relatedDreams = useMemo(() => {
    if (!selectedNode) return [];
    return dreams.filter(dream => {
      const matchPlace = dream.analysis.garden_update?.new_place === selectedNode.name;
      const matchMotifs = dream.analysis.motifs?.some(m => selectedNode.related_motifs.includes(m));
      return matchPlace || matchMotifs;
    });
  }, [selectedNode, dreams]);

  const getNodeIcon = (type: string, name: string) => {
    if (name.includes("ホーム") || name.includes("駅") || name.includes("路地") || name.includes("階段")) {
      return <Footprints className="w-5 h-5" />;
    }
    if (name.includes("部屋") || name.includes("教室") || name.includes("家") || name.includes("書斎") || name.includes("温室")) {
      return <Compass className="w-5 h-5" />;
    }
    if (name.includes("丘") || name.includes("海") || name.includes("湖") || name.includes("森") || name.includes("庭") || name.includes("入り江")) {
      return <Trees className="w-5 h-5" />;
    }
    return <Sparkles className="w-5 h-5" />;
  };

  return (
    <div className="relative w-full h-[550px] bg-gradient-to-b from-[#f8f9fa] to-[#e1e1f5] border border-white/60 rounded-[32px] overflow-hidden shadow-2xl">
      {/* Background soft moving colors */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-200/20 blur-[80px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-yellow-100/15 blur-[90px] animate-pulse-slow pointer-events-none" style={{ animationDelay: "2s" }} />

      {gardenObjects.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="p-4 rounded-full bg-white/40 border border-white/60 mb-4 shadow-sm"
          >
            <Trees className="w-10 h-10 text-[#5c5d6e]" />
          </motion.div>
          <h3 className="font-display text-lg font-normal text-[#191c1d] mb-2">まだ夢の庭に、なにも育っていません</h3>
          <p className="text-xs text-[#46464c] max-w-sm leading-relaxed">
            朝、あなたの夢のかけらを預けるたびに、そこから生まれた場所やモチーフがこの庭に芽吹き、育っていきます。
          </p>
        </div>
      ) : (
        <>
          {/* Constellation SVG connection layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(92, 93, 110, 0.2)" />
                <stop offset="100%" stopColor="rgba(230, 230, 250, 0.2)" />
              </linearGradient>
            </defs>
            {/* Draw shared connection lines */}
            {connections.map((line, idx) => (
              <motion.line
                key={`line-${idx}`}
                x1={`${line.from.x}%`}
                y1={`${line.from.y}%`}
                x2={`${line.to.x}%`}
                y2={`${line.to.y}%`}
                stroke="url(#glowGrad)"
                strokeWidth={Math.min(3, 0.5 + line.strength * 0.5)}
                strokeDasharray="4 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1.5, delay: idx * 0.1 }}
              />
            ))}
          </svg>

          {/* Interactive Nodes */}
          <div className="absolute inset-0 w-full h-full z-10">
            {nodes.map((node, idx) => {
              const isSelected = selectedNode?.object_id === node.object_id;
              return (
                <motion.div
                  key={node.object_id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedNode(node)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: idx * 0.08 }}
                >
                  {/* Glowing halo pulse */}
                  <div className={`absolute -inset-4 rounded-full bg-indigo-500/10 blur-md transition-opacity duration-300 ${isSelected ? "opacity-100 scale-125" : "opacity-0 group-hover:opacity-100"}`} />
                  
                  {/* Icon container */}
                  <div className={`relative flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300 ${
                    isSelected 
                      ? "bg-[#5c5d6e] border-[#5c5d6e] text-white shadow-lg shadow-[#5c5d6e]/15" 
                      : "bg-white/70 border border-white/80 text-[#5c5d6e] group-hover:bg-white group-hover:border-slate-300 group-hover:text-[#191c1d] shadow-sm"
                  }`}>
                    {getNodeIcon(node.type, node.name)}
                    
                    {/* Visit count indicator */}
                    {node.appearance_count > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#5c5d6e] text-[9px] font-mono font-medium text-white shadow-sm">
                        {node.appearance_count}
                      </span>
                    )}
                  </div>

                  {/* Node label text */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-md bg-white/85 border border-white/95 shadow-sm backdrop-blur-sm pointer-events-none transition-all duration-300">
                    <span className="text-[10px] font-medium text-[#46464c] group-hover:text-[#191c1d]">{node.name}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Floating Instructions Banner */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between bg-white/55 border border-white/60 backdrop-blur-md rounded-2xl px-4 py-2.5 z-20 pointer-events-none shadow-sm">
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-[#5c5d6e]" />
              <span className="text-[11px] text-[#46464c] font-medium">
                夢から芽吹いた記憶の欠片たち。タップして、その場所の物語を紐解く。
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[9px] tracking-widest text-[#77767d] uppercase font-semibold">
              {gardenObjects.length} OBJECTS ACTIVE
            </span>
          </div>
        </>
      )}

      {/* Detail Drawer (Constellation inspection overlay) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="absolute top-0 right-0 h-full w-full sm:w-[380px] bg-white/75 border-l border-white/60 shadow-2xl backdrop-blur-xl z-30 p-6 flex flex-col justify-between overflow-y-auto text-slate-800"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#e6e6fa]/50 border border-indigo-200/20 text-[#5c5d6e]">
                    {getNodeIcon(selectedNode.type, selectedNode.name)}
                  </div>
                  <span className="font-mono text-xs text-[#77767d] font-semibold">庭の場所・モチーフ</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Description */}
              <h2 className="font-display text-xl font-normal text-[#191c1d] mb-2">{selectedNode.name}</h2>
              <p className="text-xs text-[#46464c] leading-relaxed bg-white/40 border border-white p-3.5 rounded-xl mb-4 italic shadow-sm">
                {selectedNode.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-white/40 border border-white/50 rounded-xl shadow-sm">
                  <span className="block text-[10px] text-[#77767d] font-mono font-semibold uppercase">出現回数</span>
                  <span className="text-lg font-display font-medium text-[#5c5d6e]">{selectedNode.appearance_count} 回</span>
                </div>
                <div className="p-3 bg-white/40 border border-white/50 rounded-xl shadow-sm">
                  <span className="block text-[10px] text-[#77767d] font-mono font-semibold uppercase">最終更新</span>
                  <span className="text-[11px] font-sans font-medium text-[#46464c] mt-1 block">
                    {new Date(selectedNode.last_updated).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Emotions and Motifs Tags */}
              <div className="mb-6">
                <h4 className="text-[10px] font-mono text-[#77767d] uppercase tracking-wider mb-2 font-bold">関連する感情</h4>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedNode.related_emotions.map((emo, idx) => (
                    <span
                      key={`emo-${idx}`}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-[#e6e6fa]/40 border border-indigo-200/30 text-[#656677] font-medium"
                    >
                      {emo}
                    </span>
                  ))}
                </div>

                <h4 className="text-[10px] font-mono text-[#77767d] uppercase tracking-wider mb-2 font-bold">関連するモチーフ</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.related_motifs.map((mot, idx) => (
                    <span
                      key={`mot-${idx}`}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100/60 border border-slate-200/20 text-[#46464c]"
                    >
                      {mot}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Dreams Timeline */}
              {relatedDreams.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono text-[#77767d] uppercase tracking-wider mb-3 font-bold">この場所を育んだ夢</h4>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                    {relatedDreams.map((dream) => (
                      <div
                        key={dream.dream_id}
                        onClick={() => {
                          onSelectDream(dream);
                          setSelectedNode(null);
                        }}
                        className="group flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50 hover:bg-[#e6e6fa]/30 hover:border-indigo-200/30 cursor-pointer transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                           <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <div className="text-left">
                            <span className="block text-[11px] font-medium text-[#191c1d] group-hover:text-[#5c5d6e] truncate max-w-[170px]">
                              {dream.analysis.dream_title}
                            </span>
                            <span className="block text-[9px] text-[#77767d] font-mono mt-0.5">
                              {new Date(dream.created_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-[#77767d] group-hover:text-[#5c5d6e] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200/20">
              <span className="text-[9px] text-[#77767d] font-mono font-semibold">YUMEPO • INNER WEATHER GARDEN</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
