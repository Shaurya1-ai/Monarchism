import DOMPurify from "isomorphic-dompurify";

/** Strip HTML/scripts from user input — XSS mitigation */
export function sanitizeText(input: string, maxLength = 500): string {
  const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  return cleaned.trim().slice(0, maxLength);
}

export function sanitizeHtml(input: string, maxLength = 2000): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "br"],
  }).slice(0, maxLength);
}
