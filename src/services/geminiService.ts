import { MedicalTermAnalysis, ClinicalSoapReport, MedicalSpecialty } from '../types';

export async function translateSubtitle(
  text: string,
  targetLangName: string,
  sourceLangName: string = 'Auto',
  specialty: MedicalSpecialty = 'general'
): Promise<string> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang: sourceLangName,
        targetLang: targetLangName,
        specialty,
      }),
    });

    if (!res.ok) {
      throw new Error(`Medical translation API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.translated || text;
  } catch (err) {
    console.error('Failed to translate via API:', err);
    return text;
  }
}

export async function batchTranslateSubtitles(
  items: Array<{ id: string; text: string }>,
  targetLangName: string,
  specialty: MedicalSpecialty = 'general'
): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/translate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        targetLang: targetLangName,
        specialty,
      }),
    });

    if (!res.ok) {
      throw new Error(`Batch translate failed: ${res.statusText}`);
    }

    const data = await res.json();
    const map: Record<string, string> = {};
    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        map[item.id] = item.translated || item.text;
      }
    }
    return map;
  } catch (err) {
    console.error('Batch medical translation failure:', err);
    return {};
  }
}

export async function explainMedicalTerm(
  term: string,
  sentence: string,
  targetLangName: string,
  specialty: MedicalSpecialty = 'general'
): Promise<MedicalTermAnalysis> {
  const res = await fetch('/api/explain-medical-term', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      term,
      sentence,
      targetLang: targetLangName,
      specialty,
    }),
  });

  if (!res.ok) {
    throw new Error('Medical term analysis failed');
  }

  return await res.json();
}

export async function generateClinicalSoapReport(
  transcript: string,
  targetLangName: string,
  videoTitle: string,
  specialty: MedicalSpecialty = 'surgery'
): Promise<ClinicalSoapReport> {
  const res = await fetch('/api/generate-soap-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      targetLang: targetLangName,
      videoTitle,
      specialty,
    }),
  });

  if (!res.ok) {
    throw new Error('Clinical SOAP report generation failed');
  }

  return await res.json();
}
