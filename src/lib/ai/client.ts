import { GoogleGenAI } from "@google/genai";

// Single shared Gemini client, built lazily so routes can check for the key
// first and return a friendly error instead of crashing at module load.
let cached: GoogleGenAI | null = null;
export function getGemini(): GoogleGenAI {
  if (!cached) {
    cached = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return cached;
}

// The model used across all AI features. temperature 0 (set per request) plus
// caching is what makes responses effectively deterministic.
export const GEMINI_MODEL = "gemini-2.5-flash";
