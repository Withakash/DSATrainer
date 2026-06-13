// Shared error type for the AI layer. Every AI failure is normalized to one of
// these kinds so API routes can map them to friendly messages + HTTP statuses.
export type AiErrorKind =
  | "invalid_key"
  | "rate_limit"
  | "unavailable"
  | "timeout"
  | "malformed"
  | "unknown";

export class AiError extends Error {
  readonly kind: AiErrorKind;
  constructor(kind: AiErrorKind, message: string) {
    super(message);
    this.name = "AiError";
    this.kind = kind;
  }
}

// HTTP status + friendly message for each kind — used by every AI route.
export const AI_ERROR_STATUS: Record<AiErrorKind, number> = {
  invalid_key: 401,
  rate_limit: 429,
  unavailable: 503,
  timeout: 504,
  malformed: 502,
  unknown: 500,
};

export const AI_ERROR_MESSAGE: Record<AiErrorKind, string> = {
  invalid_key: "The Gemini API key is missing or invalid. Check GEMINI_API_KEY in your .env file.",
  rate_limit: "Too many AI requests right now. Please wait a moment and try again.",
  unavailable: "The AI service is temporarily unavailable. Please try again shortly.",
  timeout: "The AI request took too long. Please try again.",
  malformed: "The AI returned an unreadable response. Please try again.",
  unknown: "Something went wrong with the AI request. Please try again.",
};
