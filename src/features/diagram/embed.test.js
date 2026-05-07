import { describe, it, expect } from 'vitest';
import { normalizeDiagramEmbedUrl, getDiagramEmbedPlaceholder } from './embed';

describe('normalizeDiagramEmbedUrl', () => {
  it('passes through image URL', () => {
    expect(normalizeDiagramEmbedUrl('image', 'https://example.com/a.png')).toBe(
      'https://example.com/a.png'
    );
  });

  it('normalizes geogebra short URL to iframe URL', () => {
    const out = normalizeDiagramEmbedUrl('geogebra', 'https://www.geogebra.org/m/abc123');
    expect(out).toMatch(/material\/iframe\/id\/abc123/);
  });

  it('rejects non-geogebra host for geogebra embed', () => {
    expect(normalizeDiagramEmbedUrl('geogebra', 'https://example.com/m/abc123')).toBe('');
  });

  it('adds embed=1 for desmos URLs', () => {
    const out = normalizeDiagramEmbedUrl('desmos', 'https://www.desmos.com/calculator/xyz789');
    expect(out).toContain('embed=1');
  });

  it('rejects non-desmos host for desmos embed', () => {
    expect(normalizeDiagramEmbedUrl('desmos', 'https://geogebra.org/m/abc123')).toBe('');
  });

  it('returns empty string for invalid URL in embed mode', () => {
    expect(normalizeDiagramEmbedUrl('desmos', 'not a url')).toBe('');
  });
});

describe('getDiagramEmbedPlaceholder', () => {
  it('returns specific placeholders', () => {
    expect(getDiagramEmbedPlaceholder('geogebra')).toMatch(/GeoGebra/);
    expect(getDiagramEmbedPlaceholder('desmos')).toMatch(/Desmos/);
    expect(getDiagramEmbedPlaceholder('image')).toMatch(/слика/);
  });
});
