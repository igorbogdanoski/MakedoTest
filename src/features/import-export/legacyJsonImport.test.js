import { describe, it, expect } from 'vitest';
import { mapLegacyJsonRow, mapLegacyJsonImport } from './legacyJsonImport';

describe('mapLegacyJsonRow', () => {
  it('применува defaults за празни полиња', () => {
    const row = mapLegacyJsonRow({}, 1);
    expect(row).toEqual({
      id: 1,
      type: 'multiple',
      text: '',
      options: ['', '', '', ''],
      correct: 0,
      points: 5,
      difficulty: 'medium',
      columns: 2,
      matches: undefined,
      tableData: undefined,
    });
  });

  it('зачувува submitted полиња', () => {
    const row = mapLegacyJsonRow(
      {
        type: 'checklist',
        text: 'Q1',
        options: ['a', 'b'],
        correct: 1,
        points: 10,
        difficulty: 'hard',
        columns: 3,
        matches: [{ s: 's', a: 'a' }],
        tableData: { rows: 2, cols: 2, data: {} },
      },
      42
    );
    expect(row.id).toBe(42);
    expect(row.type).toBe('checklist');
    expect(row.options).toEqual(['a', 'b']);
    expect(row.correct).toBe(1);
    expect(row.matches).toHaveLength(1);
  });

  it('options се undefined за non-multiple type без options', () => {
    const row = mapLegacyJsonRow({ type: 'essay' }, 1);
    expect(row.options).toBeUndefined();
  });

  it('враќа null за невалиден ред', () => {
    expect(mapLegacyJsonRow(null, 1)).toBeNull();
    expect(mapLegacyJsonRow('not-object', 1)).toBeNull();
  });
});

describe('mapLegacyJsonImport', () => {
  it('мапира низа со incremental ids', () => {
    const out = mapLegacyJsonImport([{ text: 'A' }, { text: 'B' }], 1000);
    expect(out).toHaveLength(2);
    expect(out[0].id).toBe(1000);
    expect(out[1].id).toBe(1001);
  });

  it('филтрира невалидни редови', () => {
    const out = mapLegacyJsonImport([{ text: 'A' }, null, 'bad', { text: 'B' }], 1);
    expect(out).toHaveLength(2);
    expect(out[0].text).toBe('A');
    expect(out[1].text).toBe('B');
  });

  it('non-array враќа []', () => {
    expect(mapLegacyJsonImport('nope')).toEqual([]);
    expect(mapLegacyJsonImport(null)).toEqual([]);
  });
});
