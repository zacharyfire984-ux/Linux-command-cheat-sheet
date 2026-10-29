import React, { useState, useEffect } from 'react';
import {
  studyBeatsEngine,
  BEAT_PRESETS,
} from '../utils/audioBeats';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Headphones,
  Music,
} from 'lucide-react';

export const StudyBeatsWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(studyBeatsEngine.getBpm());
  const [volume, setVolume] = useState(studyBeatsEngine.getVolume());
  const [presetId, setPresetId] = useState(studyBeatsEngine.currentPresetId);
  const [drums, setDrums] = useState(studyBeatsEngine.drumsEnabled);
  const [bass, setBass] = useState(studyBeatsEngine.bassEnabled);
  const [vinyl, setVinyl] = useState(studyBeatsEngine.vinylEnabled);

  useEffect(() => {
    studyBeatsEngine.onStepCallback = (step) => {
      setCurrentStep(step);
    };
    return () => {
      studyBeatsEngine.onStepCallback = null;
    };
  }, []);

  const handleTogglePlay = () => {
    const playing = studyBeatsEngine.toggle();
    setIsPlaying(playing);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    studyBeatsEngine.setBpm(newBpm);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    studyBeatsEngine.setVolume(newVol);
  };

  const handlePresetChange = (newPresetId: string) => {
    setPresetId(newPresetId);
    studyBeatsEngine.setPreset(newPresetId);
    setBpm(studyBeatsEngine.getBpm());
  };

  const toggleDrums = () => {
    studyBeatsEngine.drumsEnabled = !drums;
    setDrums(!drums);
  };

  const toggleBass = () => {
    studyBeatsEngine.bassEnabled = !bass;
    setBass(!bass);
  };

  const toggleVinyl = () => {
    studyBeatsEngine.vinylEnabled = !vinyl;
    setVinyl(!vinyl);
  };

  const currentPreset = BEAT_PRESETS.find((p) => p.id === presetId) || BEAT_PRESETS[0];

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-40 select-none">
      {/* Expanded Control Box */}
      {isExpanded && (
        <div className="mb-3 w-80 sm:w-88 rounded-2xl bg-[#0c1322]/95 backdrop-blur-xl border border-cyan-500/30 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.7)] text-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  Study Beats & Rhythm
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    Offline
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">Low, mellow beats for Linux focus</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Minimize beats panel"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* 16-step visual rhythm bar */}
          <div className="my-3 space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>RHYTHM PULSE</span>
              <span className="text-cyan-400 font-semibold">{bpm} BPM</span>
            </div>
            <div className="grid grid-cols-16 gap-1 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              {Array.from({ length: 16 }).map((_, i) => {
                const isActive = isPlaying && currentStep === i;
                const isDownbeat = i % 4 === 0;
                return (
                  <div
                    key={i}
                    className={`h-4 rounded-sm transition-all duration-75 ${
                      isActive
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.8)] scale-y-125'
                        : isDownbeat
                        ? 'bg-slate-700/80'
                        : 'bg-slate-800/60'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Preset Selector */}
          <div className="space-y-1 mb-3">
            <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span>Beat Preset</span>
              <span className="text-[10px] text-slate-500 font-mono">{currentPreset.bpm} BPM</span>
            </label>
            <select
              value={presetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg bg-[#111a2e] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {BEAT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.bpm} BPM)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 italic pt-0.5">{currentPreset.description}</p>
          </div>

          {/* Sliders: BPM & Volume */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* BPM */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Tempo</span>
                <span className="font-mono text-cyan-400 text-[10px]">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="55"
                max="105"
                value={bpm}
                onChange={(e) => handleBpmChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Volume</span>
                <span className="font-mono text-cyan-400 text-[10px]">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Sound Layer Toggles */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 text-[10px] font-mono">LAYERS:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={toggleDrums}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                  drums
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                Drums
              </button>
              <button
                type="button"
                onClick={toggleBass}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                  bass
                    ? 'bg-blue-950 text-blue-300 border border-blue-600/50'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                Sub-Bass
              </button>
              <button
                type="button"
                onClick={toggleVinyl}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                  vinyl
                    ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                Vinyl
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Collapsed / Pill Button */}
      <div className="flex items-center gap-1 bg-[#111a2e]/90 hover:bg-[#15203a] border border-cyan-500/40 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-1 pr-3 transition group">
        <button
          type="button"
          onClick={handleTogglePlay}
          title={isPlaying ? 'Pause Study Beats' : 'Start Study Beats'}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isPlaying
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,212,255,0.6)]'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 pl-1.5 text-left cursor-pointer"
        >
          {/* Animated visualizer bars when playing */}
          <div className="flex items-end gap-0.5 h-4 w-4">
            <span
              className={`w-0.5 rounded-full transition-all duration-100 ${
                isPlaying ? 'bg-cyan-400 h-full animate-pulse' : 'bg-slate-600 h-1'
              }`}
            />
            <span
              className={`w-0.5 rounded-full transition-all duration-100 ${
                isPlaying ? 'bg-cyan-300 h-3/4' : 'bg-slate-600 h-2'
              }`}
            />
            <span
              className={`w-0.5 rounded-full transition-all duration-100 ${
                isPlaying ? 'bg-blue-400 h-4/5' : 'bg-slate-600 h-1.5'
              }`}
            />
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-200 leading-tight flex items-center gap-1">
              <span>Study Beats</span>
              {isPlaying && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <div className="text-[9px] font-mono text-cyan-400 leading-none">
              {isPlaying ? `${bpm} BPM · Playing` : 'Turn on rhythm'}
            </div>
          </div>

          <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 ml-1 transition" />
        </button>
      </div>
    </div>
  );
};
