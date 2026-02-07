/**
 * Input sanitization for AI calls using Microsoft Spotlighting (datamarking).
 *
 * Datamarking wraps user-provided text with delimiters so the LLM can
 * distinguish user content from system instructions, mitigating prompt injection.
 *
 * Reference: https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/system-message
 */

const DATAMARK_PREFIX = "^";
const DATAMARK_SUFFIX = "^";

/**
 * Wraps user-provided text with datamark delimiters.
 * Every word is individually marked to prevent injection.
 */
export function datamark(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${DATAMARK_PREFIX}${word}${DATAMARK_SUFFIX}`)
    .join(" ");
}

/**
 * Sanitize text output from LLM before rendering.
 * Strips potential XSS vectors from AI-generated content.
 */
export function sanitizeOutput(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/<iframe\b[^>]*>/gi, "")
    .replace(/<object\b[^>]*>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/<form\b[^>]*>/gi, "");
}

/**
 * Strip any datamark artifacts that might leak into output.
 */
export function stripDatamarks(text: string): string {
  return text.replace(/\^/g, "").trim();
}
