import React from 'react';
import { DeviceMode } from '../types';
import { Monitor, Tablet, Smartphone, Maximize2, Stethoscope, ShieldCheck } from 'lucide-react';

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
      {/* Top Medical Workstation Bar */}
      <div className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs z-30">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <div className="flex items-center gap-1 text-cyan-400 font-bold tracking-wide">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>OmniTrans Medical</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-300 font-medium">進階醫療影音即時多語翻譯瀏覽器</span>
          <span className="hidden lg:inline text-slate-600">•</span>
          <span className="hidden lg:inline-flex items-center gap-1 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-3 h-3" />
            MeSH 醫學術語精準校驗
          </span>
        </div>

        {/* Device Switcher (Desktop / Tablet / Mobile / Fluid) */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => onDeviceModeChange('auto')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              deviceMode === 'auto'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="自適應全螢幕 (Auto Responsive)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">自適應</span>
          </button>

          <button
            onClick={() => onDeviceModeChange('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="電腦醫師工作站 (Desktop Clinic View)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>電腦</span>
          </button>

          <button
            onClick={() => onDeviceModeChange('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              deviceMode === 'tablet'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="手術室 / 查房平板 (OR Tablet / iPad View)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>平板</span>
          </button>

          <button
            onClick={() => onDeviceModeChange('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="醫師手機行動端 (Mobile Rounding View)"
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
          <div className="w-full max-w-[840px] h-[calc(100vh-60px)] max-h-[1050px] flex flex-col bg-slate-900 border-[10px] border-slate-800 rounded-[36px] overflow-hidden shadow-2xl ring-2 ring-cyan-500/30 relative">
            {/* Tablet Camera dot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-700 rounded-full z-40"></div>
            <div className="flex-1 flex flex-col overflow-hidden pt-3">
              {children}
            </div>
          </div>
        )}

        {deviceMode === 'mobile' && (
          <div className="w-full max-w-[420px] h-[calc(100vh-60px)] max-h-[880px] flex flex-col bg-slate-900 border-[10px] border-slate-800 rounded-[44px] overflow-hidden shadow-2xl ring-2 ring-cyan-500/30 relative">
            {/* Mobile Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-40 border border-slate-800/50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800 mr-2"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/40"></div>
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
