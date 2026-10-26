import React, { useState } from 'react';
import { SAMPLE_VIDEOS } from '../constants/sampleVideos';
import { VideoItem, SubtitleSettings, MedicalSpecialty } from '../types';
import { Play, Stethoscope, Sparkles, Clock, CheckCircle, ShieldCheck, Tag } from 'lucide-react';
import { MEDICAL_SPECIALTIES } from '../constants/medicalSpecialties';

interface VideoLibraryViewProps {
  onSelectVideo: (video: VideoItem) => void;
  currentVideoId: string;
  subtitleSettings: SubtitleSettings;
}

export const VideoLibraryView: React.FC<VideoLibraryViewProps> = ({
  onSelectVideo,
  currentVideoId,
  subtitleSettings,
}) => {
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('all');

  const filteredVideos = SAMPLE_VIDEOS.filter((v) => {
    if (selectedSpecialtyFilter === 'all') return true;
    return v.specialty === selectedSpecialtyFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/60">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Medical Banner */}
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>進階醫療影音資料庫 • MeSH & ICD 醫學認證</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              高階微創手術、心導管介入與標靶免疫治療案例研討
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              點擊任一專科示範影片，畫面下方將自動以雙語呈現高精準度臨床醫學字幕。支援解剖學與藥理學實體標註、隨選 MeSH 辭典查詢及自動撰寫 SOAP 臨床病歷報告。
            </p>
          </div>
        </div>

        {/* Specialty Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <button
            onClick={() => setSelectedSpecialtyFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedSpecialtyFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            全部專科案例 ({SAMPLE_VIDEOS.length})
          </button>
          {MEDICAL_SPECIALTIES.slice(0, 5).map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialtyFilter(spec.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                selectedSpecialtyFilter === spec.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{spec.icon}</span>
              <span>{spec.name}</span>
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredVideos.map((video) => {
            const isCurrent = video.id === currentVideoId;
            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col bg-slate-950/70 ${
                  isCurrent
                    ? 'border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500'
                    : 'border-slate-800/80 hover:border-slate-700 hover:shadow-xl'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40"></div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-cyan-500 transition-all">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur border border-white/10 text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-cyan-400" />
                      <span>{video.category}</span>
                    </span>
                  </div>

                  {video.icdCode && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                        {video.icdCode}
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-600 text-[11px] font-bold text-white flex items-center gap-1 shadow-md">
                        <CheckCircle className="w-3 h-3" />
                        <span>正在研討播放</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  {video.meshTerms && video.meshTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.meshTerms.map((mesh, mIdx) => (
                        <span
                          key={mIdx}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono"
                        >
                          MeSH: {mesh}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>醫學級逐字稿 ({video.defaultCues.length} 段精確標註)</span>
                    </span>
                    <span className="text-cyan-400 font-bold group-hover:underline">
                      立即開啟觀看 →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
