export const OPEN_RESPONSE_TYPES = new Set(['short-answer', 'fill-blanks', 'essay']);

export function isOpenResponseType(type) {
  return OPEN_RESPONSE_TYPES.has(type);
}

export function createDefaultResponseConfig(type) {
  if (!isOpenResponseType(type)) return undefined;
  return {
    allowMathEditor: true,
    allowHandwrittenUpload: false,
    requireQrForAttachment: true,
  };
}

export function resolveResponseConfig(question) {
  const defaults = createDefaultResponseConfig(question?.type);
  if (!defaults) {
    return {
      allowMathEditor: false,
      allowHandwrittenUpload: false,
      requireQrForAttachment: false,
    };
  }

  return {
    ...defaults,
    ...(question?.responseConfig || {}),
  };
}
