/**
 * Chunk plain text into overlapping windows suitable for embeddings.
 */
export function chunkText(input, options = {}) {
  const chunkSize = Number(options.chunkSize ?? 900);
  const overlap = Number(options.overlap ?? 150);
  const minChunkLength = Number(options.minChunkLength ?? 80);

  if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive number');
  }
  if (!Number.isFinite(overlap) || overlap < 0 || overlap >= chunkSize) {
    throw new Error('overlap must be >= 0 and < chunkSize');
  }

  const text = normalizeWhitespace(String(input ?? ''));
  if (!text) return [];

  const out = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const hardEnd = Math.min(start + chunkSize, text.length);
    const end = pickBoundary(text, start, hardEnd);
    const value = text.slice(start, end).trim();

    if (value.length >= minChunkLength || end >= text.length) {
      out.push({
        id: `chunk-${index}`,
        text: value,
        start,
        end,
      });
      index += 1;
    }

    if (end >= text.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return out;
}

function normalizeWhitespace(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pickBoundary(text, start, hardEnd) {
  if (hardEnd >= text.length) return text.length;

  const window = text.slice(start, hardEnd);
  const paragraphBreak = window.lastIndexOf('\n\n');
  if (paragraphBreak >= 0 && paragraphBreak > window.length * 0.5) {
    return start + paragraphBreak + 2;
  }

  const sentenceBreak = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('? '),
    window.lastIndexOf('! ')
  );
  if (sentenceBreak >= 0 && sentenceBreak > window.length * 0.45) {
    return start + sentenceBreak + 2;
  }

  const spaceBreak = window.lastIndexOf(' ');
  if (spaceBreak >= 0 && spaceBreak > window.length * 0.4) {
    return start + spaceBreak + 1;
  }

  return hardEnd;
}
