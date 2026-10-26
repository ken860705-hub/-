import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SubtitleCue, SubtitleSettings } from '../types';
import { SubtitleDock } from './SubtitleDock';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  currentCue: SubtitleCue | null;
  subtitleSettings: SubtitleSettings;
  onOpenSettings: () => void;
  onWordClick: (word: string, contextSentence: string) => void;
  isTranslating?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  currentCue,
  subtitleSettings,
  onOpenSettings,
  onWordClick,
  isTranslating = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Parse if it's a YouTube link
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1`
      : null;
  };

  const youtubeUrl = getYouTubeEmbedUrl(videoUrl);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    onTimeUpdate(time);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    setDuration(dur);
    onDurationChange(dur);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      onTimeUpdate(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Auto-hide controls when mouse is inactive
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase())) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        if (videoRef.current) videoRef.current.currentTime += 5;
      } else if (e.code === 'ArrowLeft') {
        if (videoRef.current) videoRef.current.currentTime -= 5;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full h-full min-h-[280px] sm:min-h-[420px] bg-black flex flex-col items-center justify-center overflow-hidden group select-none"
    >
      {youtubeUrl ? (
        <div className="w-full h-full aspect-video">
          <iframe
            src={youtubeUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          className="w-full h-full max-h-[75vh] object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Subtitle Overlay in 'video-overlay' position mode */}
      {subtitleSettings.position === 'video-overlay' && (
        <SubtitleDock
          currentCue={currentCue}
          subtitleSettings={subtitleSettings}
          onOpenSettings={onOpenSettings}
          onWordClick={onWordClick}
          isTranslating={isTranslating}
        />
      )}

      {/* Video Overlay Controls */}
      {!youtubeUrl && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 sm:p-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Timeline Scrubber */}
          <div className="relative mb-2 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-200">
            {/* Left Controls: Play, Time, Volume */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                title={isPlaying ? '暫停 (空白鍵)' : '播放 (空白鍵)'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <div className="text-slate-300 font-mono text-xs flex items-center gap-1">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <button onClick={toggleMute} className="p-1 text-slate-400 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Right Controls: Speed, Subtitle trigger, Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Speed menu */}
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-0.5 text-xs">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`px-1 rounded ${
                      playbackRate === rate ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
                title="全螢幕切換"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
