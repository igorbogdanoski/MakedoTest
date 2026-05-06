import { describe, it, expect } from 'vitest';
import {
  buildEJournalRows,
  buildSpreadsheetArtifacts,
  rowsToCsv,
  rowsToTsv,
} from './spreadsheetExport';

describe('spreadsheetExport', () => {
  const attempts = [
    {
      studentId: 's1',
      gradeLevel: 8,
      semester: 'S1',
      totalScore: 18,
      maxScore: 20,
      items: [
        { qid: 'q1', earned: 1, max: 1 },
        { qid: 'q2', earned: 0, max: 1 },
      ],
    },
    {
      studentId: 's2',
      gradeLevel: 8,
      semester: 'S2',
      totalScore: 12,
      maxScore: 20,
      items: [
        { qid: 'q1', earned: 1, max: 1 },
        { qid: 'q2', earned: 1, max: 1 },
      ],
    },
  ];

  const questions = [
    { id: 'q1', type: 'multiple', text: 'Објасни', bloomLevel: 'understand' },
    { id: 'q2', type: 'essay', text: 'Креирај' },
  ];

  it('builds e-journal rows with percent', () => {
    const rows = buildEJournalRows(attempts);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ studentId: 's1', grade: '8', semester: 'S1' });
    expect(rows[0].percent).toBe('90.00');
  });

  it('serializes rows to csv and tsv', () => {
    const headers = [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
    ];
    const rows = [{ a: 'x', b: 'y' }];
    expect(rowsToCsv(rows, headers)).toContain('A,B');
    expect(rowsToTsv(rows, headers)).toContain('A\tB');
  });

  it('builds all spreadsheet artifacts', () => {
    const artifacts = buildSpreadsheetArtifacts({ attempts, questions });
    expect(artifacts.journalCsv).toContain('Student ID');
    expect(artifacts.itemCsv).toContain('QID');
    expect(artifacts.cohortCsv).toContain('Grade');
    expect(artifacts.bloomCsv).toContain('Bloom Level');
    expect(artifacts.journalTsv).toContain('\t');
  });
});
