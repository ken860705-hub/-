import { MedicalSpecialty } from '../types';

export interface SpecialtyMeta {
  id: MedicalSpecialty;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  color: string;
}

export const MEDICAL_SPECIALTIES: SpecialtyMeta[] = [
  {
    id: 'surgery',
    name: '外科與微創手術',
    nameEn: 'Surgery & Robotics',
    icon: '✂️',
    description: '達文西機器人手臂、腹腔鏡微創術式、解剖層次與術中止血',
    color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  },
  {
    id: 'cardiology',
    name: '心臟內外科與介入',
    nameEn: 'Cardiology & TAVR',
    icon: '🫀',
    description: '經導管主動脈瓣置換 (TAVR)、冠狀動脈支架介入 (PCI)、心電生理',
    color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
  },
  {
    id: 'oncology',
    name: '腫瘤醫學與免疫細胞',
    nameEn: 'Oncology & CAR-T',
    icon: '🧬',
    description: 'CAR-T 細胞免疫療法、免疫檢查點抑制劑、分子標靶基因突變',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    id: 'neurology',
    name: '神經醫學與腦神經外科',
    nameEn: 'Neurosurgery & Brain',
    icon: '🧠',
    description: '術中皮質運動電生理監測、立體定向腦瘤微創切除、膠質母細胞瘤',
    color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  },
  {
    id: 'radiology',
    name: '醫學影像與放射診斷',
    nameEn: 'Radiology & Imaging',
    icon: '🩻',
    description: 'MRI 磁振造影高階對比、CT 血管攝影、都卜勒超音波判讀',
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  },
  {
    id: 'critical_care',
    name: '急重症與加護醫學',
    nameEn: 'Critical Care & ICU',
    icon: '🩺',
    description: '敗血性休克復甦處置、升壓劑滴定、呼吸器通氣與動脈導管監控',
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
  },
  {
    id: 'pharmacology',
    name: '藥理學與臨床試驗',
    nameEn: 'Pharmacology & Trials',
    icon: '💊',
    description: '藥物動力學 (PK/PD)、劑量計算、藥物不良反應與交互作用',
    color: 'border-teal-500/40 text-teal-400 bg-teal-500/10',
  },
  {
    id: 'general',
    name: '全科醫學與臨床會診',
    nameEn: 'Internal Medicine & OSCE',
    icon: '🏥',
    description: '跨專科臨床查房病例研討、OSCE 客觀結構化臨床測驗與醫病溝通',
    color: 'border-slate-500/40 text-slate-400 bg-slate-500/10',
  },
];
