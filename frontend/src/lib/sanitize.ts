import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const sanitizeHtml = (content: string): string => {
  const html = marked.parse(content) as string;
  return DOMPurify.sanitize(html);
};
