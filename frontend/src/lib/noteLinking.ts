import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface NoteLinkInfo {
  id: number;
  title: string;
}

// Parse [[wikilinks]] in raw markdown text
export const parseWikilinks = (content: string, notes: NoteLinkInfo[]): string => {
  if (!content) return '';

  // Build a map of title -> id for quick lookup
  const titleToId = new Map<string, number>();
  notes.forEach((note) => {
    titleToId.set(note.title.toLowerCase(), note.id);
  });

  // Replace [[title]] with clickable links
  const wikilinkRegex = /\[\[([^\]]+)\]\]/g;

  const result = content.replace(wikilinkRegex, (match, title) => {
    const noteId = titleToId.get(title.toLowerCase().trim());
    if (noteId) {
      return `[Note: ${title}](#/note/${noteId})`;
    }
    // If no matching note found, keep the original text but remove brackets
    return `\\[${title}\\]`;
  });

  return result;
};

// Convert wikilinks to markdown links for display
export const wikilinkToMarkdown = (content: string): string => {
  if (!content) return '';
  return content.replace(/\[\[([^\]]+)\]\]/g, '**[[$1]]**');
};

// Extract all wikilink titles from content
export const extractWikilinkTitles = (content: string): string[] => {
  if (!content) return [];
  const matches = content.match(/\[\[([^\]]+)\]\]/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(2, -2));
};

// Sanitize and render markdown with wikilink highlighting
export const renderContentWithWikilinks = (content: string): string => {
  const html = marked.parse(content) as string;
  return DOMPurify.sanitize(html);
};
