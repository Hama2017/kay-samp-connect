import DOMPurify from 'dompurify';

/**
 * Sanitizes user-generated content and applies hashtag styling
 * Prevents XSS attacks by removing malicious scripts
 */
export const sanitizeContent = (content: string): string => {
  // First apply hashtag styling
  const contentWithHashtags = content.replace(
    /#(\w+)/g, 
    '<span style="color: #1f9463; font-weight: 600;">#$1</span>'
  );
  
  // Then sanitize to remove any malicious code
  return DOMPurify.sanitize(contentWithHashtags, {
    ALLOWED_TAGS: ['span', 'br', 'p', 'strong', 'em', 'u'],
    ALLOWED_ATTR: ['style']
  });
};
