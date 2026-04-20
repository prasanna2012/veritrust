import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  isAuthentic: boolean;
  confidenceScore: number;
  findings: string[];
  summary: string;
  detectedAnomalies: {
    type: string;
    description: string;
    severity: "low" | "medium" | "high";
  }[];
}

export async function analyzeDocument(
  input: { text?: string; fileData?: { data: string; mimeType: string } }, 
  type: "certificate" | "resume"
): Promise<AnalysisResult> {
  const prompt = `
    DETERMINE IF THE FOLLOWING ${type.toUpperCase()} IS AUTHENTIC OR FAKE.
    
    As a forensic document expert, your goal is to identify genuine credentials while flagging clear forgeries. 
    
    CRITERIA FOR AUTHENTICITY (Recognize these as GOOD signs):
    1. STANDARD GOVERNMENT FORMATS: Documents like "10th Memo", "SSC", or "Board Certificates" often have specific, consistent terminology (e.g., "Roll No", "Hall Ticket No", "Grade Point", "Division").
    2. LOGICAL PROGRESSION: Dates that align with standard academic years (e.g., 10th grade at age 15-16).
    3. INSTITUTIONAL SPECIFICITY: Mention of real boards (e.g., CBSE, ICSE, State Boards), specific school names, and recognized subjects.
    
    CRITERIA FOR "FAKE" CLASSIFICATION (Flag ONLY if definitive):
    1. IMPOSSIBLE TIMELINES: e.g., 10th grade completed in 6 months, or degree earned before birth.
    2. CONTRADICTORY DATA: Different names or dates for the same person within one document.
    3. CLEAR FORGERY MARKERS: Use of "Sample", "Template", or generic placeholder text (e.g., "University Name Here").
    4. ANOMALOUS PHRASING: Official documents using slang or highly informal language.

    IMPORTANT GUIDELINE:
    - Default to "isAuthentic: true" if the document looks like a standard government or institutional record.
    - Only set "isAuthentic: false" if there is CLEAR, UNDENIABLE evidence of tampering or logical impossibility.
    - If you are unsure, set "isAuthentic: true" but lower the "confidenceScore" and list your concerns in "findings".
    
    Return the analysis in JSON format.
  `;

  const contents: any[] = [{ text: prompt }];
  
  if (input.text) {
    contents.push({ text: `TEXT TO ANALYZE:\n"""\n${input.text}\n"""` });
  }
  
  if (input.fileData) {
    contents.push({
      inlineData: {
        data: input.fileData.data,
        mimeType: input.fileData.mimeType
      }
    });
  }

  let retries = 3;
  let lastError: any = null;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isAuthentic: { type: Type.BOOLEAN },
              confidenceScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
              findings: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              detectedAnomalies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
                  },
                  required: ["type", "description", "severity"]
                }
              }
            },
            required: ["isAuthentic", "confidenceScore", "findings", "summary", "detectedAnomalies"]
          }
        }
      });

      return JSON.parse(response.text || "{}") as AnalysisResult;
    } catch (e: any) {
      lastError = e;
      if (e.message?.includes("503") || e.message?.includes("demand") || e.message?.includes("429")) {
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }
      throw e;
    }
  }

  throw lastError || new Error("Failed to analyze document after retries");
}
