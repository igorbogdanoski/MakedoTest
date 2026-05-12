import { describe, it, expect } from 'vitest';
import { buildQtiExportXml, parseQtiImport } from './qtiLegacy';

describe('buildQtiExportXml', () => {
  it('вградува subject како title', () => {
    const xml = buildQtiExportXml({ subject: 'Математика' }, []);
    expect(xml).toContain('title="Математика"');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  it('сериализира секое прашање како assessmentItem', () => {
    const xml = buildQtiExportXml({ subject: 'X' }, [
      { id: 1, type: 'multiple', text: 'Q1' },
      { id: 2, type: 'essay', text: 'Q2' },
    ]);
    expect(xml).toContain('identifier="1"');
    expect(xml).toContain('title="multiple"');
    expect(xml).toContain('<p>Q1</p>');
    expect(xml).toContain('identifier="2"');
    expect(xml).toContain('<p>Q2</p>');
  });

  it('handles missing fields safely', () => {
    const xml = buildQtiExportXml(null, null);
    expect(xml).toContain('title=""');
    expect(xml).not.toContain('assessmentItem');
  });
});

describe('parseQtiImport', () => {
  it('мапира assessmentItem елементи во прашања', () => {
    const xml = `<?xml version="1.0"?>
<assessmentTest>
  <assessmentItem><itemBody><p>Прво</p></itemBody></assessmentItem>
  <assessmentItem><itemBody><p>Второ</p></itemBody></assessmentItem>
</assessmentTest>`;
    const parser = new DOMParser();
    const out = parseQtiImport(xml, parser, 100);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({
      id: 100,
      type: 'multiple',
      text: 'Прво',
      points: 5,
      correct: 0,
    });
    expect(out[1].id).toBe(101);
    expect(out[1].text).toBe('Второ');
  });

  it('default text за празни <p>', () => {
    const xml = `<assessmentTest><assessmentItem><itemBody></itemBody></assessmentItem></assessmentTest>`;
    const out = parseQtiImport(xml, new DOMParser(), 1);
    expect(out[0].text).toBe('Увезена задача');
  });

  it('non-string или missing parser враќа []', () => {
    expect(parseQtiImport(null, new DOMParser())).toEqual([]);
    expect(parseQtiImport('<x/>', null)).toEqual([]);
  });
});
