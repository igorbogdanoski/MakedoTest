export function buildQtiExportXml(testInfo, questions) {
  const title = testInfo?.subject || '';
  const items = Array.isArray(questions) ? questions : [];
  const itemsXml = items
    .map(
      (q) => `
  <assessmentItem identifier="${q?.id ?? ''}" title="${q?.type ?? ''}">
    <itemBody><p>${q?.text ?? ''}</p></itemBody>
  </assessmentItem>`
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" title="${title}">
  ${itemsXml}
</assessmentTest>`;
}

export function parseQtiImport(xmlString, parser, baseTimestamp = Date.now()) {
  if (typeof xmlString !== 'string' || !parser) return [];
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const items = xmlDoc.getElementsByTagName('assessmentItem');
  return Array.from(items).map((item, i) => ({
    id: baseTimestamp + i,
    type: 'multiple',
    text: item.getElementsByTagName('p')[0]?.textContent || 'Увезена задача',
    points: 5,
    options: ['', '', ''],
    correct: 0,
  }));
}
