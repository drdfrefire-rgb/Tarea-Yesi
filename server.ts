import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { generatePhysicsDiagramSVG, sanitizeSvgCode } from './src/lib/diagramGenerator';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Physics solver endpoint
app.post('/api/solve-physics', async (req, res) => {
  try {
    const { problemStatement, category, image } = req.body;

    if (!problemStatement && !image) {
      return res.status(400).json({ error: 'Se requiere el enunciado del problema o una imagen.' });
    }

    const ai = getGenAI();

    const systemPrompt = `Eres un profesor universitario experto en Física General y Mecánica.
Resuelve el ejercicio con rigor didáctico, precisión matemática y formulas LaTeX.

INSTRUCCIONES:
1. ESQUEMA / DIAGRAMA:
   - Proporciona un título descriptivo y breve explicación del esquema físico y Diagrama de Cuerpo Libre (DCL).
   - Opcionalmente puedes incluir código SVG limpio (<svg viewBox="0 0 720 400"...>...</svg>) o dejarlo conciso, pues el motor de ingeniería vectorial del sistema generará el trazado a escala con cotas de datos e incógnitas.
2. CANTIDADES: Desglosa todas las cantidades conocidas con su valor y unidad, y las incógnitas a calcular.
3. DERIVACIÓN: Pasos secuenciales claros, cada uno con explicación concisa y fórmulas LaTeX ($...$).
4. RESULTADOS FINALES: Valores numéricos finales con unidades e interpretación breve.`;

    const contents: any[] = [];

    // Multimodal image support
    if (image && image.data && image.mimeType) {
      contents.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    const promptText = `Resuelve este ejercicio de física con rigor pedagógico, derivación matemática e incógnitas destacadas:
ENUNCIADO: ${problemStatement || 'Analiza el problema mostrado en la imagen adjunta.'}
${category ? `CATEGORÍA: ${category}` : ''}`;

    contents.push({ text: promptText });

    const generateConfig = {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Título corto del problema' },
          category: { type: Type.STRING, description: 'Categoría (cinematica, dinamica, energia_trabajo, etc.)' },
          difficulty: { type: Type.STRING, description: 'Básico, Intermedio o Avanzado' },
          diagram: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              svgCode: { type: Type.STRING, description: 'SVG completo o dejar vacío' },
            },
            required: ['title', 'description'],
          },
          knowns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                value: { type: Type.STRING },
                unit: { type: Type.STRING },
                notes: { type: Type.STRING },
              },
              required: ['symbol', 'name', 'value'],
            },
          },
          unknowns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                targetUnit: { type: Type.STRING },
                calculatedValue: { type: Type.STRING },
                notes: { type: Type.STRING },
              },
              required: ['symbol', 'name', 'targetUnit', 'calculatedValue'],
            },
          },
          principles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          assumptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          coordinateSystem: { type: Type.STRING },
          derivationSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                mathLatex: { type: Type.STRING },
                intermediateResult: { type: Type.STRING },
              },
              required: ['stepNumber', 'title', 'explanation', 'mathLatex'],
            },
          },
          symbolicFormula: { type: Type.STRING },
          numericalSubstitution: { type: Type.STRING },
          finalAnswers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                value: { type: Type.STRING },
                unit: { type: Type.STRING },
                interpretation: { type: Type.STRING },
              },
              required: ['symbol', 'name', 'value', 'unit'],
            },
          },
          physicalDiscussion: { type: Type.STRING },
          commonMistakesOrTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'title',
          'category',
          'difficulty',
          'diagram',
          'knowns',
          'unknowns',
          'derivationSteps',
          'finalAnswers',
        ],
      },
    };

    // Resilient candidate model cascade: fast models first, instant fallback on 429/503
    const CANDIDATE_MODELS = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-3.8-flash',
    ];
    let response: any = null;
    let lastErr: any = null;
    const maxAttempts = CANDIDATE_MODELS.length * 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const modelName = CANDIDATE_MODELS[(attempt - 1) % CANDIDATE_MODELS.length];
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: generateConfig,
        });
        if (response?.text) break;
      } catch (err: any) {
        lastErr = err;
        console.warn(`Model ${modelName} (attempt ${attempt}/${maxAttempts}) error:`, err.status || err.code || err.message);
        const isTransient =
          err.status === 503 ||
          err.code === 503 ||
          err.status === 429 ||
          err.status === 404 ||
          err.message?.includes('high demand') ||
          err.message?.includes('UNAVAILABLE') ||
          err.message?.includes('quota');

        if (!isTransient || attempt === maxAttempts) {
          throw err;
        }
        // Only pause if we have finished a full cycle of all candidate models
        if (attempt % CANDIDATE_MODELS.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }

    if (!response && lastErr) {
      throw lastErr;
    }

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('La respuesta de Gemini no contiene texto');
    }

    const solutionData = JSON.parse(textOutput);
    // Attach unique ID and timestamp
    solutionData.id = 'sol-' + Date.now();
    solutionData.problemStatement = problemStatement || 'Problema desde imagen adjunta';
    solutionData.createdAt = Date.now();

    // Ensure diagram structure and pristine vector SVG
    if (!solutionData.diagram) {
      solutionData.diagram = {
        title: 'Esquema Físico & Diagrama de Cuerpo Libre (DCL)',
        description: 'Representación vectorial a escala con cotas de datos e incógnitas',
      };
    }

    const proceduralSvg = generatePhysicsDiagramSVG({
      title: solutionData.title,
      category: solutionData.category || category,
      problemStatement: problemStatement || 'Problema de física',
      knowns: solutionData.knowns || [],
      unknowns: solutionData.unknowns || [],
    });

    const sanitizedAiSvg = sanitizeSvgCode(solutionData.diagram?.svgCode);

    solutionData.diagram.proceduralSvgCode = proceduralSvg;
    // Always guarantee a rich, complete SVG is rendered
    solutionData.diagram.svgCode = sanitizedAiSvg || proceduralSvg;

    return res.json(solutionData);
  } catch (error: any) {
    console.error('Error in /api/solve-physics:', error);
    const isOverloaded =
      error?.status === 503 ||
      error?.code === 503 ||
      error?.message?.includes('high demand') ||
      error?.message?.includes('UNAVAILABLE');

    const message = isOverloaded
      ? 'El servicio está experimentando alta demanda momentánea. Por favor pulsa "Resolver Ejercicio" de nuevo.'
      : error.message || 'Error al procesar el ejercicio de física.';

    return res.status(isOverloaded ? 503 : 500).json({
      error: message,
    });
  }
});

// Follow-up questions about a solved problem
app.post('/api/ask-followup', async (req, res) => {
  try {
    const { problemTitle, problemStatement, userQuestion, previousSolutionSummary } = req.body;

    if (!userQuestion) {
      return res.status(400).json({ error: 'La pregunta no puede estar vacía.' });
    }

    const ai = getGenAI();

    const CANDIDATE_MODELS = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-3.8-flash',
    ];
    let response: any = null;
    let lastErr: any = null;
    const maxAttempts = CANDIDATE_MODELS.length * 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const modelName = CANDIDATE_MODELS[(attempt - 1) % CANDIDATE_MODELS.length];
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: `Actúas como un profesor de física paciente y riguroso.
El estudiante está revisando la solución del problema: "${problemTitle}".
Enunciado: "${problemStatement}".
Resumen de la solución: "${previousSolutionSummary}".

Pregunta o duda del estudiante:
"${userQuestion}"

Responde con precisión física, citando las leyes o fórmulas pertinentes en formato Markdown y LaTeX cuando corresponda ($...$ o $$...$$). Sé claro, pedagógico y directo.`,
        });
        if (response?.text) break;
      } catch (err: any) {
        lastErr = err;
        console.warn(`Model ${modelName} ask-followup (attempt ${attempt}/${maxAttempts}) error:`, err.status || err.code || err.message);
        const isTransient =
          err.status === 503 ||
          err.code === 503 ||
          err.status === 429 ||
          err.status === 404 ||
          err.message?.includes('high demand') ||
          err.message?.includes('UNAVAILABLE') ||
          err.message?.includes('quota');

        if (!isTransient || attempt === maxAttempts) {
          throw err;
        }
        if (attempt % CANDIDATE_MODELS.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }

    if (!response && lastErr) {
      throw lastErr;
    }

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in /api/ask-followup:', error);
    const isOverloaded =
      error?.status === 503 ||
      error?.code === 503 ||
      error?.message?.includes('high demand') ||
      error?.message?.includes('UNAVAILABLE');

    const message = isOverloaded
      ? 'El tutor conceptual está ocupado. Inténtalo de nuevo en unos segundos.'
      : error.message || 'Error al responder la consulta de física.';

    return res.status(isOverloaded ? 503 : 500).json({
      error: message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Physics solver server running on port ${PORT}`);
  });
}

startServer();
