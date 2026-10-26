import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DeviceContainer } from './components/DeviceContainer';
import { BrowserNavbar } from './components/BrowserNavbar';
import { VideoPlayer } from './components/VideoPlayer';
import { SubtitleDock } from './components/SubtitleDock';
import { SubtitleSettingsModal } from './components/SubtitleSettingsModal';
import { TranscriptDrawer } from './components/TranscriptDrawer';
import { VocabModal } from './components/VocabModal';
import { VideoLibraryView } from './components/VideoLibraryView';
import { LocalVideoUploadView } from './components/LocalVideoUploadView';
import { LiveMicView } from './components/LiveMicView';
import { SAMPLE_VIDEOS } from './constants/sampleVideos';
import { VideoItem, SubtitleCue, SubtitleSettings, DeviceMode } from './types';
import { translateSubtitle, batchTranslateSubtitles } from './services/geminiService';

export default function App() {
  // Device mode: auto (fluid), desktop, tablet, mobile
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('auto');

  // Active view tab: video, library, upload, live-mic
  const [activeTab, setActiveTab] = useState<'video' | 'library' | 'upload' | 'live-mic'>('video');

  // Current Video
  const [currentVideo, setCurrentVideo] = useState<VideoItem>(SAMPLE_VIDEOS[0]);
  const [cues, setCues] = useState<SubtitleCue[]>(SAMPLE_VIDEOS[0].defaultCues);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Advanced Medical Subtitle Settings
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>({
    targetLanguage: 'zh-TW', // 繁體中文 default
    sourceLanguage: 'auto',
    specialty: 'surgery', // default surgical procedure
    bilingualMode: true,
    fontSize: 'lg',
    fontColor: 'yellow',
    bgOpacity: 85,
    position: 'bottom-dock', // default pinned at bottom
    autoTTS: false,
    showVocabHints: true,
    highlightMedicalEntities: true,
    showMedicalConfidence: true,
    highContrastBorder: true,
  });

  // UI Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [vocabModal, setVocabModal] = useState<{
    isOpen: boolean;
    word: string;
    contextSentence: string;
  }>({
    isOpen: false,
    word: '',
    contextSentence: '',
  });

  // Real-time live mic
  const [isLiveMicActive, setIsLiveMicActive] = useState(false);
  const [liveCues, setLiveCues] = useState<SubtitleCue[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  // Update cues whenever currentVideo changes
  useEffect(() => {
    setCues(currentVideo.defaultCues || []);
    setCurrentTime(0);
    if (currentVideo.specialty) {
      setSubtitleSettings((prev) => ({ ...prev, specialty: currentVideo.specialty }));
    }
  }, [currentVideo.id]);

  // Translate cues on target language or specialty change if not yet translated
  useEffect(() => {
    const target = subtitleSettings.targetLanguage;
    const untranslated = cues.filter((c) => !c.translations[target]);

    if (untranslated.length > 0 && untranslated.length <= 15) {
      setIsTranslating(true);
      const items = untranslated.map((c) => ({ id: c.id, text: c.originalText }));

      batchTranslateSubtitles(items, target, subtitleSettings.specialty)
        .then((translatedMap) => {
          setCues((prev) =>
            prev.map((c) => {
              if (translatedMap[c.id]) {
                return {
                  ...c,
                  translations: {
                    ...c.translations,
                    [target]: translatedMap[c.id],
                  },
                };
              }
              return c;
            })
          );
        })
        .catch(console.error)
        .finally(() => setIsTranslating(false));
    }
  }, [subtitleSettings.targetLanguage, subtitleSettings.specialty, cues.length]);

  // Determine current active subtitle cue
  const activeVideoCue = useMemo(() => {
    // If live mic was recently active within last 4 seconds, show it
    if (liveCues.length > 0) {
      const latestLive = liveCues[0];
      const now = Date.now() / 1000;
      if (now <= latestLive.endTime + 2) {
        return latestLive;
      }
    }

    // Otherwise find cue from video timeline
    return cues.find((c) => currentTime >= c.startTime && currentTime <= c.endTime) || null;
  }, [cues, currentTime, liveCues]);

  // Auto translate individual active cue if missing
  const lastTranslatedCueIdRef = useRef<string>('');
  useEffect(() => {
    if (!activeVideoCue) return;
    const target = subtitleSettings.targetLanguage;

    if (!activeVideoCue.translations[target] && lastTranslatedCueIdRef.current !== activeVideoCue.id) {
      lastTranslatedCueIdRef.current = activeVideoCue.id;
      setIsTranslating(true);
      translateSubtitle(activeVideoCue.originalText, target, 'Auto', subtitleSettings.specialty)
        .then((translated) => {
          setCues((prev) =>
            prev.map((c) =>
              c.id === activeVideoCue.id
                ? {
                    ...c,
                    translations: {
                      ...c.translations,
                      [target]: translated,
                    },
                  }
                : c
            )
          );
        })
        .finally(() => setIsTranslating(false));
    }
  }, [activeVideoCue?.id, subtitleSettings.targetLanguage, subtitleSettings.specialty]);

  // Handle navigate URL from address bar
  const handleNavigateUrl = (url: string) => {
    const isDirect = url.includes('.mp4') || url.includes('.webm') || url.includes('.m3u8');
    const newVideo: VideoItem = {
      id: `nav-${Date.now()}`,
      title: isDirect ? url.split('/').pop() || '臨床手術/醫學串流' : '線上醫學串流',
      category: '醫學線上串流',
      specialty: subtitleSettings.specialty,
      originalLanguage: 'auto',
      videoUrl: url,
      duration: 0,
      thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      description: `串流網址: ${url}`,
      defaultCues: [],
      isCustomUrl: true,
    };
    setCurrentVideo(newVideo);
    setActiveTab('video');
  };

  // Handle word click in subtitle to open MeSH medical dictionary
  const handleWordClick = (word: string, contextSentence: string) => {
    setVocabModal({
      isOpen: true,
      word,
      contextSentence,
    });
  };

  // Handle new live cue from mic
  const handleNewLiveCue = (cue: SubtitleCue) => {
    setLiveCues((prev) => [cue, ...prev.slice(0, 50)]);
    setCues((prev) => [...prev, cue]);
  };

  return (
    <DeviceContainer deviceMode={deviceMode} onDeviceModeChange={setDeviceMode}>
      {/* Medical Browser Navbar & Omnibox */}
      <BrowserNavbar
        currentUrl={currentVideo.videoUrl}
        onNavigateUrl={handleNavigateUrl}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        videoTitle={currentVideo.title}
        subtitleSettings={subtitleSettings}
        onUpdateSettings={(newVals) => setSubtitleSettings((prev) => ({ ...prev, ...newVals }))}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onToggleTranscript={() => setIsTranscriptOpen(!isTranscriptOpen)}
        isTranscriptOpen={isTranscriptOpen}
        transcriptCount={cues.length}
        isLiveMicActive={isLiveMicActive}
        onToggleLiveMic={() => {
          setIsLiveMicActive(!isLiveMicActive);
          if (!isLiveMicActive) setActiveTab('live-mic');
        }}
        onRefresh={() => setCurrentTime(0)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-slate-950">
        {/* TAB 1: Main Medical Video Player & Bottom Subtitle Dock */}
        {activeTab === 'video' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 flex items-center justify-center relative min-h-0 bg-black">
              <VideoPlayer
                videoUrl={currentVideo.videoUrl}
                title={currentVideo.title}
                currentTime={currentTime}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
                currentCue={activeVideoCue}
                subtitleSettings={subtitleSettings}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onWordClick={handleWordClick}
                isTranslating={isTranslating}
              />
            </div>

            {/* Bottom Subtitle Dock (When position is 'bottom-dock') */}
            {subtitleSettings.position === 'bottom-dock' && (
              <SubtitleDock
                currentCue={activeVideoCue}
                subtitleSettings={subtitleSettings}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onWordClick={handleWordClick}
                isTranslating={isTranslating}
              />
            )}
          </div>
        )}

        {/* TAB 2: Curated World Advanced Medical Library */}
        {activeTab === 'library' && (
          <VideoLibraryView
            onSelectVideo={(video) => {
              setCurrentVideo(video);
              setActiveTab('video');
            }}
            currentVideoId={currentVideo.id}
            subtitleSettings={subtitleSettings}
          />
        )}

        {/* TAB 3: Local Surgical Footage / Case Upload */}
        {activeTab === 'upload' && (
          <LocalVideoUploadView
            onLoadCustomVideo={(video) => {
              setCurrentVideo(video);
              setActiveTab('video');
            }}
          />
        )}

        {/* TAB 4: Live Clinical Rounds & OSCE Audio Translator */}
        {activeTab === 'live-mic' && (
          <LiveMicView
            subtitleSettings={subtitleSettings}
            onNewLiveCue={handleNewLiveCue}
            isListening={isLiveMicActive}
            onToggleListening={() => setIsLiveMicActive(!isLiveMicActive)}
          />
        )}
      </div>

      {/* Subtitle & Specialty Settings Modal */}
      <SubtitleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={subtitleSettings}
        onUpdateSettings={(newVals) => setSubtitleSettings((prev) => ({ ...prev, ...newVals }))}
      />

      {/* Clinical Transcript & SOAP Notes Drawer */}
      <TranscriptDrawer
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        cues={cues}
        currentTime={currentTime}
        onSeek={(time) => {
          setCurrentTime(time);
          setActiveTab('video');
        }}
        subtitleSettings={subtitleSettings}
        videoTitle={currentVideo.title}
      />

      {/* MeSH Medical Dictionary & Clinical Precautions Modal */}
      <VocabModal
        isOpen={vocabModal.isOpen}
        onClose={() => setVocabModal((prev) => ({ ...prev, isOpen: false }))}
        word={vocabModal.word}
        contextSentence={vocabModal.contextSentence}
        subtitleSettings={subtitleSettings}
      />
    </DeviceContainer>
  );
}
