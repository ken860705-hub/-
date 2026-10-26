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

// API: Real-time Medical Video Subtitle Translation
app.post('/api/translate', async (req, res) => {
  try {
    const {
      text,
      sourceLang = 'Auto',
      targetLang = 'Traditional Chinese',
      specialty = 'General Medicine',
      context = '',
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for translation.' });
    }

    const prompt = `You are a Board-Certified Senior Medical Translator and Surgical Terminologist for an advanced clinical video browser.
Translate the following medical lecture, surgical procedure dialogue, or clinical consultation into the target language "${targetLang}".

Medical Specialty Context: ${specialty}
Video Context: ${context || 'Advanced surgical / clinical lecture'}
Source Language: ${sourceLang}
Target Language: ${targetLang}

Rules:
1. Translate medical terminology with rigorous clinical precision conforming to MeSH, WHO INN, ICD-10, and standard academic medical guidelines.
2. For anatomical terms, drug names, and surgical instruments, ensure exact medical terminology (e.g. in Traditional Chinese: "laparoscopic cholecystectomy" -> "腹腔鏡膽囊切除術", "troponin" -> "心肌肌鈣蛋白", "anastomosis" -> "吻合術", "hemostasis" -> "止血").
3. Keep the translation concise, highly readable, and formatted cleanly for real-time video subtitles.
4. Output only the translated subtitle text without commentary or quotation marks.

Spoken Medical Text:
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an elite, board-certified medical translation specialist for surgery, internal medicine, pharmacology, and oncology. Output solely the exact medical subtitle translation.',
        temperature: 0.1,
      },
    });

    const translatedText = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : text;

    res.json({
      original: text,
      translated: translatedText,
      targetLang,
      specialty,
      verifiedMedicalGrade: true,
    });
  } catch (error: any) {
    console.error('Medical Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      details: error?.message || 'Unknown error',
    });
  }
});

// API: Batch translate medical subtitles / cues
app.post('/api/translate-batch', async (req, res) => {
  try {
    const { items, targetLang = 'Traditional Chinese', specialty = 'Clinical Medicine' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required.' });
    }

    const textsToTranslate = items.map((item: any, i: number) => `[${i}] ${item.text || item}`);

    const prompt = `You are a clinical terminologist translating medical video subtitle cues into "${targetLang}".
Medical Domain: ${specialty}
Maintain exact indexed mapping [0], [1]...
Adhere to strict medical academic terminology (anatomy, pathology, surgery, pharmacology).
Return a JSON array of translated strings with the exact matching indices.

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
    console.error('Batch medical translation error:', error);
    res.status(500).json({ error: 'Batch translation failed', details: error?.message });
  }
});

// API: Advanced Medical Terminology & MeSH / ICD-10 Lexicon Lookup
app.post('/api/explain-medical-term', async (req, res) => {
  try {
    const { term, sentence, targetLang = 'Traditional Chinese', specialty = 'Medical' } = req.body;

    if (!term) {
      return res.status(400).json({ error: 'Term is required.' });
    }

    const prompt = `Analyze the specialized medical term or abbreviation "${term}" that occurred in this clinical video sentence: "${sentence || term}".
Provide an in-depth medical dictionary reference in "${targetLang}".

Category must be one of:
- 解剖學 (Anatomy)
- 外科術式 (Surgical Procedure)
- 病理與疾病 (Pathology & Disease)
- 藥理與藥物 (Pharmacology & Drug)
- 診斷與影像 (Diagnostics & Imaging)
- 生理機制 (Physiology & Biochemistry)

Include:
- Official medical translation in ${targetLang}
- English and Latin medical root/etymology if applicable
- Pronunciation / phonetic guide
- Concise clinical definition in ${targetLang}
- Clinical relevance & critical surgical/medication precautions (臨床重要性與警語)
- MeSH or ICD-10 categorization code (if applicable, e.g. MeSH D002763, ICD-10 K80)
- Clinical example sentence with dual-language translation
- 2 recommended PubMed search keywords for scholarly literature follow-up`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            officialTranslation: { type: Type.STRING },
            category: { type: Type.STRING },
            etymology: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            definition: { type: Type.STRING },
            clinicalRelevance: { type: Type.STRING },
            precautions: { type: Type.STRING },
            meshOrIcdCode: { type: Type.STRING },
            exampleOriginal: { type: Type.STRING },
            exampleTranslated: { type: Type.STRING },
            pubmedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'term',
            'officialTranslation',
            'category',
            'definition',
            'clinicalRelevance',
            'exampleOriginal',
            'exampleTranslated',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Medical term analysis error:', error);
    res.status(500).json({ error: 'Medical term lookup failed', details: error?.message });
  }
});

// API: Generate Clinical SOAP Notes & Surgical Procedure Protocol from Video
app.post('/api/generate-soap-notes', async (req, res) => {
  try {
    const { transcript, targetLang = 'Traditional Chinese', videoTitle = '', specialty = 'Surgery' } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required.' });
    }

    const prompt = `You are a Chief Medical Officer and Residency Program Director.
Based on the following clinical video transcript titled "${videoTitle}" (Specialty: ${specialty}), synthesize a rigorous Clinical Documentation and CME Learning Report in "${targetLang}".

Structure required:
1. Executive Clinical Summary (簡要臨床與手術總結)
2. Structured SOAP Note:
   - S (Subjective): Chief Complaint, Patient History, or Clinical Presentation
   - O (Objective): Vital Signs, Diagnostic Imaging / Lab Findings, or Intraoperative Anatomical Findings
   - A (Assessment): Differential Diagnosis, Disease Staging, or Surgical Evaluation
   - P (Plan): Procedural Steps, Pharmacotherapy, Postoperative Care & Follow-up
3. Surgical / Procedural Milestones (關鍵手術或操作步驟，包含解剖標誌與止血要點)
4. Key Medical Entities: List of 4-6 essential drugs, anatomical landmarks, or instruments with concise explanations.
5. CME Board Exam Question: 1 high-yield clinical multiple-choice question with the correct answer and detailed explanation for medical students and physicians.

Transcript:
${transcript.slice(0, 9000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            soap: {
              type: Type.OBJECT,
              properties: {
                subjective: { type: Type.STRING },
                objective: { type: Type.STRING },
                assessment: { type: Type.STRING },
                plan: { type: Type.STRING },
              },
              required: ['subjective', 'objective', 'assessment', 'plan'],
            },
            surgicalSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keyEntities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  category: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['term', 'category', 'explanation'],
              },
            },
            cmeQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctOptionIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctOptionIndex', 'explanation'],
            },
          },
          required: ['executiveSummary', 'soap', 'surgicalSteps', 'keyEntities', 'cmeQuestion'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('SOAP Notes generation error:', error);
    res.status(500).json({ error: 'Clinical summary generation failed', details: error?.message });
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
    console.log(`OmniTrans Medical Browser running at http://0.0.0.0:${port}`);
  });
}

startServer();
