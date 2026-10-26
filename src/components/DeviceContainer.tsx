import React from 'react';
import { DeviceMode } from '../types';
import { Monitor, Tablet, Smartphone, Maximize2 } from 'lucide-react';

interface DeviceContainerProps {
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  children: React.ReactNode;
}

export const DeviceContainer: React.FC<DeviceContainerProps> = ({
  deviceMode,
  onDeviceModeChange,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Device Bar & Quick Selector */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs z-30">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-200 tracking-wide">OmniTrans Engine</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">跨平台影音即時多語翻譯瀏覽器</span>
        </div>

        {/* Device Switcher (Laptop / Tablet / Mobile / Fluid) */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => onDeviceModeChange('auto')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              deviceMode === 'auto'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="自適應全螢幕 (Auto Responsive)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">自適應</span>
          </button>

          <button
            onClick={() => onDeviceModeChange('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="電腦桌面檢視 (Desktop View)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>電腦</span>
          </button>

          <button
            onClick={() => onDeviceModeChange('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              deviceMode === 'tablet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="平板檢視 (Tablet iPad View)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>平板</span>
          </button>

          <button
            onClick={() => onDeviceModeChange('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="手機檢視 (Mobile Phone View)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>手機</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 flex items-center justify-center p-0 sm:p-2 lg:p-4 overflow-auto">
        {deviceMode === 'auto' && (
          <div className="w-full h-full min-h-[calc(100vh-42px)] flex flex-col bg-slate-900 border border-slate-800 sm:rounded-xl overflow-hidden shadow-2xl">
            {children}
          </div>
        )}

        {deviceMode === 'desktop' && (
          <div className="w-full max-w-7xl h-[calc(100vh-60px)] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {children}
          </div>
        )}

        {deviceMode === 'tablet' && (
          <div className="w-full max-w-[840px] h-[calc(100vh-60px)] max-h-[1050px] flex flex-col bg-slate-900 border-[10px] border-slate-800 rounded-[36px] overflow-hidden shadow-2xl ring-2 ring-slate-700/60 relative">
            {/* Tablet Camera dot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-700 rounded-full z-40"></div>
            <div className="flex-1 flex flex-col overflow-hidden pt-3">
              {children}
            </div>
          </div>
        )}

        {deviceMode === 'mobile' && (
          <div className="w-full max-w-[420px] h-[calc(100vh-60px)] max-h-[880px] flex flex-col bg-slate-900 border-[10px] border-slate-800 rounded-[44px] overflow-hidden shadow-2xl ring-2 ring-slate-700/60 relative">
            {/* Mobile Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-40 border border-slate-800/50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800 mr-2"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500/40"></div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden pt-6">
              {children}
            </div>
            {/* Mobile Home Indicator bar */}
            <div className="h-4 bg-slate-950 flex items-center justify-center">
              <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
