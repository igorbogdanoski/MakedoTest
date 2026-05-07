export const DIAGRAM_EMBED_TYPES = ['image', 'geogebra', 'desmos'];

function isValidUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isGeoGebraHost(hostname) {
  const host = hostname.toLowerCase();
  return host === 'geogebra.org' || host === 'www.geogebra.org';
}

function isDesmosHost(hostname) {
  const host = hostname.toLowerCase();
  return host === 'desmos.com' || host === 'www.desmos.com' || host === 'teacher.desmos.com';
}

function normalizeGeoGebraUrl(url) {
  const match = url.pathname.match(/^\/m\/([a-zA-Z0-9]+)/);
  if (match) {
    const materialId = match[1];
    return `https://www.geogebra.org/material/iframe/id/${materialId}/width/900/height/560/border/888888/sfsb/true/smb/false/stb/false/stbh/true/ai/false/asb/false/sri/false/rc/false`;
  }
  return url.toString();
}

function normalizeDesmosUrl(url) {
  if (!url.searchParams.has('embed')) {
    url.searchParams.set('embed', '1');
  }
  return url.toString();
}

export function normalizeDiagramEmbedUrl(embedType, rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';

  if (embedType === 'image') {
    return trimmed;
  }

  const url = isValidUrl(trimmed);
  if (!url) return '';

  if (embedType === 'geogebra') {
    if (!isGeoGebraHost(url.hostname)) return '';
    return normalizeGeoGebraUrl(url);
  }

  if (embedType === 'desmos') {
    if (!isDesmosHost(url.hostname)) return '';
    return normalizeDesmosUrl(url);
  }

  return '';
}

export function getDiagramEmbedPlaceholder(embedType) {
  if (embedType === 'geogebra') {
    return 'GeoGebra линк (пр. https://www.geogebra.org/m/abc123)';
  }
  if (embedType === 'desmos') {
    return 'Desmos линк (пр. https://www.desmos.com/calculator/abc123)';
  }
  return 'Линк до слика на дијаграм...';
}
