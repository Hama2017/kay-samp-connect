import DOMPurify from 'dompurify';

/**
 * Sanitizes user-generated content and styles hashtags
 * Protects against XSS attacks by removing malicious scripts
 * Preserves line breaks and paragraphs
 * @param content - Raw user content that may contain HTML
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeContent = (content: string): string => {
  // First convert line breaks to <br> tags
  let processedContent = content.replace(/\n/g, '<br>');
  
  // Apply hashtag styling
  processedContent = processedContent.replace(
    /#(\w+)/g, 
    '<span style="color: #1f9463; font-weight: 600;">#$1</span>'
  );
  
  // Then sanitize to remove any malicious scripts or HTML
  return DOMPurify.sanitize(processedContent, {
    ALLOWED_TAGS: ['span', 'br', 'p', 'strong', 'em', 'u'],
    ALLOWED_ATTR: ['style']
  });
};
