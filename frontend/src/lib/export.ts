import { Note } from '@/store/noteStore';

export function exportNoteAsMarkdown(note: Note): void {
  const tags = note.tags.map((t) => `#${t.name}`).join(' ');
  const category = note.category ? `**Category:** ${note.category.name}` : '';
  
  const markdown = `# ${note.title}

${category}
${tags ? `**Tags:** ${tags}` : ''}
**Created:** ${new Date(note.createdAt).toLocaleDateString()}
**Updated:** ${new Date(note.updatedAt).toLocaleDateString()}

---

${note.content || 'No content'}
`;

  downloadFile(markdown, `${sanitizeFilename(note.title)}.md`, 'text/markdown');
}

export function exportNoteAsText(note: Note): void {
  const tags = note.tags.map((t) => `#${t.name}`).join(' ');
  const category = note.category ? `Category: ${note.category.name}` : '';
  
  const text = `${note.title}

${category}
${tags ? `Tags: ${tags}` : ''}
Created: ${new Date(note.createdAt).toLocaleDateString()}
Updated: ${new Date(note.updatedAt).toLocaleDateString()}

---

${note.content || 'No content'}
`;

  downloadFile(text, `${sanitizeFilename(note.title)}.txt`, 'text/plain');
}

export function exportNoteAsHtml(note: Note): void {
  const tags = note.tags.map((t) => `<span class="tag">#${t.name}</span>`).join(' ');
  const category = note.category ? `<p><strong>Category:</strong> ${note.category.name}</p>` : '';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(note.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; margin-right: 8px; }
    .content { margin-top: 1.5rem; }
  </style>
</head>
<body>
  <h1>${escapeHtml(note.title)}</h1>
  <div class="meta">
    ${category}
    ${tags ? `<p><strong>Tags:</strong> ${tags}</p>` : ''}
    <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleDateString()}</p>
    <p><strong>Updated:</strong> ${new Date(note.updatedAt).toLocaleDateString()}</p>
  </div>
  <hr>
  <div class="content">
    ${note.content || '<p>No content</p>'}
  </div>
</body>
</html>`;

  downloadFile(html, `${sanitizeFilename(note.title)}.html`, 'text/html');
}

export function exportNoteAsPdf(note: Note): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tags = note.tags.map((t) => `#${t.name}`).join(' ');
  const category = note.category ? `<p><strong>Category:</strong> ${note.category.name}</p>` : '';

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(note.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; margin-right: 8px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(note.title)}</h1>
  <div class="meta">
    ${category}
    ${tags ? `<p><strong>Tags:</strong> ${tags}</p>` : ''}
    <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleDateString()}</p>
    <p><strong>Updated:</strong> ${new Date(note.updatedAt).toLocaleDateString()}</p>
  </div>
  <hr>
  <div>${note.content || '<p>No content</p>'}</div>
</body>
</html>`);
  printWindow.document.close();
  printWindow.print();
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\- ]/gi, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 100) || 'untitled';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
