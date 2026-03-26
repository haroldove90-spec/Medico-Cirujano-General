import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeMedicalNote(note: string) {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: `Actúa como un Asistente Médico Quirúrgico de IA experto en Cirugía General.
    
    Analiza la siguiente nota médica y estructúrala.
    
    REGLAS:
    1. Identifica signos de alarma (ej. Leucocitosis >10k, fiebre, Murphy+, taquicardia).
    2. Calcula escalas de riesgo:
       - ASA (I-VI)
       - Goldman (Clase I-IV)
       - Caprini (Riesgo bajo, moderado, alto, muy alto)
    3. Si falta información crítica (ayuno, laboratorios específicos, antecedentes), lístala en "datosFaltantes".
    4. El JSON estructurado debe ser completo para una base de datos médica.
    
    NOTA MÉDICA:
    ${note}
    
    RESPUESTA REQUERIDA EN FORMATO JSON:
    {
      "resumenEjecutivo": "Resumen de 3 líneas máximo",
      "signosYSintomas": [
        {"signo": "Nombre", "valor": "Valor", "estado": "normal|alerta|critico"}
      ],
      "jsonEstructurado": { ...objeto completo... },
      "conductaSugerida": "Markdown con sugerencias",
      "riesgos": {
        "asa": "Clasificación",
        "goldman": "Clase",
        "caprini": "Nivel de riesgo",
        "justificacion": "Breve explicación"
      },
      "datosFaltantes": ["Dato 1", "Dato 2"]
    }` }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Error parsing AI response", e);
    throw new Error("Error al procesar la respuesta de la IA");
  }
}
