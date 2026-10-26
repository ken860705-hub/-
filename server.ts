import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: Real-time subtitle translation
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'Auto', targetLang = 'Traditional Chinese', context = '' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for translation.' });
    }

    const prompt = `You are a real-time video subtitle translator for a video streaming browser.
Translate the following video subtitle or spoken sentence into the target language "${targetLang}".
Keep the translation natural, concise, and suitable for video subtitles (easy to read quickly).
Do not add commentary, notes, or explanations. Only return the exact translation.

Source Language context: ${sourceLang}
Target Language: ${targetLang}
Video Context: ${context || 'General video stream / speech'}

Text to translate:
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an ultra-fast, professional video subtitle translator. Output only the translated subtitle text.',
        temperature: 0.2,
      },
    });

    const translatedText = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : text;

    res.json({
      original: text,
      translated: translatedText,
      targetLang,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      details: error?.message || 'Unknown error',
    });
  }
});

// API: Batch translate subtitles / cues
app.post('/api/translate-batch', async (req, res) => {
  try {
    const { items, targetLang = 'Traditional Chinese' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required.' });
    }

    const textsToTranslate = items.map((item: any, i: number) => `[${i}] ${item.text || item}`);

    const prompt = `Translate each subtitle line into "${targetLang}". Keep the exact line index [0], [1], etc.
Maintain exact tone and subtitle readability. Return a JSON array of translated strings matching the order.

Lines:
${textsToTranslate.join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              translated: { type: Type.STRING },
            },
            required: ['index', 'translated'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    const results = items.map((item: any, idx: number) => {
      const match = parsed.find((p: any) => p.index === idx);
      return {
        ...item,
        translated: match ? match.translated : item.text || item,
      };
    });

    res.json({ results });
  } catch (error: any) {
    console.error('Batch translation error:', error);
    res.status(500).json({ error: 'Batch translation failed', details: error?.message });
  }
});

// API: Audio chunk transcription and timestamped subtitle generation
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', targetLang = 'Traditional Chinese' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required.' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: audioBase64,
      },
    };

    const textPart = {
      text: `Listen to this video audio clip and produce synchronized subtitle entries.
For each segment/sentence, provide:
1. start (estimated start time in seconds, relative to this clip)
2. end (estimated end time in seconds)
3. original (exact transcribed spoken text in original language)
4. translation (accurate translation into ${targetLang})

If there is only silence or music, return an empty array.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [audioPart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              start: { type: Type.NUMBER },
              end: { type: Type.NUMBER },
              original: { type: Type.STRING },
              translation: { type: Type.STRING },
            },
            required: ['start', 'end', 'original', 'translation'],
          },
        },
      },
    });

    const subtitles = JSON.parse(response.text || '[]');
    res.json({ subtitles });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    res.status(500).json({ error: 'Transcription failed', details: error?.message });
  }
});

// API: Word / Term Vocabulary & Grammar Insight
app.post('/api/explain-vocab', async (req, res) => {
  try {
    const { term, sentence, targetLang = 'Traditional Chinese' } = req.body;

    if (!term) {
      return res.status(400).json({ error: 'Term is required.' });
    }

    const prompt = `Analyze the term or phrase "${term}" that appeared in this video sentence: "${sentence || term}".
Explain it for a language learner in "${targetLang}".
Include:
- phonetic / pronunciation guide (IPA, Pinyin, or Romaji as appropriate)
- part of speech
- definition in ${targetLang}
- nuances / cultural context / slang if applicable
- 1 example sentence with translation in ${targetLang}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            definition: { type: Type.STRING },
            nuance: { type: Type.STRING },
            exampleOriginal: { type: Type.STRING },
            exampleTranslated: { type: Type.STRING },
          },
          required: ['term', 'pronunciation', 'definition', 'exampleOriginal', 'exampleTranslated'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Vocabulary explanation error:', error);
    res.status(500).json({ error: 'Failed to explain vocabulary', details: error?.message });
  }
});

// API: Video Content Summary & Key Takeaways
app.post('/api/summarize-transcript', async (req, res) => {
  try {
    const { transcript, targetLang = 'Traditional Chinese', videoTitle = '' } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required.' });
    }

    const prompt = `Based on the following video subtitle transcript titled "${videoTitle}", provide a structured study summary in "${targetLang}":
1. A concise overview (2-3 sentences)
2. 3 to 5 key takeaway bullet points
3. Key keywords or vocabulary introduced in the video with short explanations.

Transcript:
${transcript.slice(0, 8000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            takeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  translation: { type: Type.STRING },
                },
                required: ['word', 'translation'],
              },
            },
          },
          required: ['overview', 'takeaways', 'keywords'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Summarization failed', details: error?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`OmniTrans Browser server running at http://0.0.0.0:${port}`);
  });
}

startServer();
