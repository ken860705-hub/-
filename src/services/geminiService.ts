import { VocabAnalysis, VideoSummary } from '../types';

export async function translateSubtitle(
  text: string,
  targetLangName: string,
  sourceLangName: string = 'Auto'
): Promise<string> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang: sourceLangName,
        targetLang: targetLangName,
      }),
    });

    if (!res.ok) {
      throw new Error(`Translation API error: ${res.statusText}`);
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
  targetLangName: string
): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/translate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        targetLang: targetLangName,
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
    console.error('Batch translation failure:', err);
    return {};
  }
}

export async function explainVocabulary(
  term: string,
  sentence: string,
  targetLangName: string
): Promise<VocabAnalysis> {
  const res = await fetch('/api/explain-vocab', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      term,
      sentence,
      targetLang: targetLangName,
    }),
  });

  if (!res.ok) {
    throw new Error('Vocabulary lookup failed');
  }

  return await res.json();
}

export async function summarizeTranscript(
  transcript: string,
  targetLangName: string,
  videoTitle: string
): Promise<VideoSummary> {
  const res = await fetch('/api/summarize-transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      targetLang: targetLangName,
      videoTitle,
    }),
  });

  if (!res.ok) {
    throw new Error('Summary generation failed');
  }

  return await res.json();
}
