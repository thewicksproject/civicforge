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
 *
 * NOTE: Regex-based sanitization is inherently limited and cannot guarantee
 * completeness against novel bypass techniques. For production hardening,
 * consider replacing this with a DOM-based sanitizer such as DOMPurify
 * running server-side via jsdom.
 */
export function sanitizeOutput(text: string): string {
  return text
    // Script tags (including content between them)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // SVG tags (can contain onload, onclick, and other executable handlers)
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<\/svg>/gi, "")
    // Math tags (can execute scripts in some browser contexts)
    .replace(/<math\b[^<]*(?:(?!<\/math>)<[^<]*)*<\/math>/gi, "")
    .replace(/<\/math>/gi, "")
    // Style tags (CSS injection vector)
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<\/style>/gi, "")
    // Link tags (external resource loading, CSS injection)
    .replace(/<link\b[^>]*\/?>/gi, "")
    // Meta tags (redirect injection, charset manipulation)
    .replace(/<meta\b[^>]*\/?>/gi, "")
    // Base tags (URL hijacking for all relative URLs on page)
    .replace(/<base\b[^>]*\/?>/gi, "")
    // Inline event handlers (onclick, onload, onerror, etc.)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    // Event handlers without quotes
    .replace(/on\w+\s*=\s*[^\s>]+/gi, "")
    // javascript: protocol in any context
    .replace(/javascript:/gi, "")
    // data:text/html (XSS via data URIs)
    .replace(/data:text\/html/gi, "")
    // CSS expression() function (legacy IE, still a known vector)
    .replace(/expression\s*\(/gi, "")
    // CSS url() with javascript: protocol
    .replace(/url\s*\(\s*['"]?\s*javascript:/gi, "url(")
    // Iframe, object, embed, form tags
    .replace(/<iframe\b[^>]*>/gi, "")
    .replace(/<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>/gi, "")
    .replace(/<\/object>/gi, "")
    .replace(/<embed\b[^>]*\/?>/gi, "")
    .replace(/<form\b[^>]*>/gi, "")
    .replace(/<\/form>/gi, "");
}

/**
 * Strip any datamark artifacts that might leak into output.
 */
export function stripDatamarks(text: string): string {
  return text.replace(/\^/g, "").trim();
}
