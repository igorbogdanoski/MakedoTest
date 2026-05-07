/**
 * Phase 4.2 — DOCX export via the `docx` npm package.
 *
 * Generates a properly structured Word document (.docx) from MakedoTest
 * question arrays, then triggers a browser download.
 *
 * Exports:
 *   buildTestDocx(testData)  — returns a docx.Document instance
 *   downloadTestDocx(testData) — generates blob, triggers download
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  convertInchesToTwip,
  UnderlineType,
} from 'docx';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALPHA = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З'];
const INDENT = convertInchesToTwip(0.3);
const INDIGO = '4F46E5';
const LIGHT_GRAY = 'F1F5F9';
const BORDER_COLOR = 'CBD5E1';

const DIFF_LABELS = { easy: 'лесно', medium: 'средно', hard: 'тешко' };
// ---------------------------------------------------------------------------
// Helper text runs
// ---------------------------------------------------------------------------

function boldRun(text, color = '1E293B') {
  return new TextRun({ text, bold: true, color, size: 20 });
}

function normalRun(text, color = '334155') {
  return new TextRun({ text, color, size: 20 });
}

function smallRun(text, color = '64748B') {
  return new TextRun({ text, color, size: 16 });
}

function emptyLine() {
  return new Paragraph({ children: [] });
}

// ---------------------------------------------------------------------------
// Question body helpers (per type)
// ---------------------------------------------------------------------------

function renderMultiple(q) {
  const options = q.options ?? [];
  return options.map(
    (opt, i) =>
      new Paragraph({
        indent: { left: INDENT },
        children: [boldRun(`${ALPHA[i] ?? `${i + 1}.`}  `, '6366F1'), normalRun(opt)],
        spacing: { after: 40 },
      })
  );
}

function renderTrueFalse() {
  return [
    new Paragraph({
      indent: { left: INDENT },
      children: [normalRun('☐  Точно          ☐  Неточно')],
      spacing: { after: 80 },
    }),
  ];
}

function renderFillBlanks(q) {
  const parts = (q.text ?? '').split('___');
  const paras = [];
  parts.forEach((part, i) => {
    if (part) {
      paras.push(
        new Paragraph({
          children: [normalRun(part)],
          spacing: { after: 40 },
        })
      );
    }
    if (i < parts.length - 1) {
      paras.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
          },
          children: [],
          spacing: { after: 80 },
        })
      );
    }
  });
  return paras;
}

function renderOrdering(q) {
  const items = q.items ?? q.options ?? [];
  return items.map(
    (item, i) =>
      new Paragraph({
        indent: { left: INDENT },
        children: [
          boldRun(`${i + 1}.  `, '94A3B8'),
          normalRun(typeof item === 'string' ? item : item.text),
        ],
        spacing: { after: 40 },
      })
  );
}

function renderMatching(q) {
  const pairs = q.pairs ?? q.options ?? [];
  return pairs.map((pair, i) => {
    const left = typeof pair === 'object' ? (pair.left ?? pair.question ?? '') : pair;
    const right = typeof pair === 'object' ? (pair.right ?? pair.answer ?? '___') : '___';
    return new Paragraph({
      indent: { left: INDENT },
      children: [
        boldRun(`${i + 1}.  `, '6366F1'),
        normalRun(left),
        normalRun('   →   ', '94A3B8'),
        normalRun(right),
      ],
      spacing: { after: 40 },
    });
  });
}

function renderStatements(q) {
  const statements = q.statements ?? [];
  return statements.map(
    (stmt, i) =>
      new Paragraph({
        indent: { left: INDENT },
        children: [
          boldRun(`${i + 1}.  `, '94A3B8'),
          normalRun(typeof stmt === 'string' ? stmt : stmt.text),
          normalRun('     '),
          smallRun('☐ Т   ☐ Н'),
        ],
        spacing: { after: 40 },
      })
  );
}

function renderTable(q) {
  const headers = q.headers ?? [];
  const rows = q.rows ?? [];

  const tableRows = [];

  if (headers.length) {
    tableRows.push(
      new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: LIGHT_GRAY },
              children: [new Paragraph({ children: [boldRun(h, '1E293B')] })],
            })
        ),
      })
    );
  }

  rows.forEach((row) => {
    const cells = Array.isArray(row) ? row : [];
    tableRows.push(
      new TableRow({
        children: cells.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph({ children: [normalRun(cell ?? '')] })],
            })
        ),
      })
    );
  });

  if (!tableRows.length) return [];
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),
    emptyLine(),
  ];
}

function renderAnswerBox() {
  return [
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
        left: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
        right: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
      },
      children: [new TextRun({ text: '\n\n\n', size: 20 })],
      spacing: { before: 60, after: 80 },
    }),
  ];
}

function renderQuestionBody(q) {
  const { type } = q;
  if (type === 'multiple' || type === 'checklist') return renderMultiple(q);
  if (type === 'true-false') return renderTrueFalse();
  if (type === 'fill-blanks') return renderFillBlanks(q);
  if (type === 'ordering') return renderOrdering(q);
  if (type === 'matching' || type === 'multi-match') return renderMatching(q);
  if (type === 'statements') return renderStatements(q);
  if (type === 'table') return renderTable(q);
  // short-answer, essay, list, diagram, multi-part, selection → blank answer box
  return renderAnswerBox();
}

// ---------------------------------------------------------------------------
// Build full document paragraphs array
// ---------------------------------------------------------------------------

function buildParagraphs(questions) {
  const paras = [];
  let counter = 0;

  for (const q of questions) {
    if (q.type === 'section') {
      paras.push(emptyLine());
      paras.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [boldRun(q.text ?? '', INDIGO)],
          spacing: { before: 120, after: 60 },
        })
      );
      continue;
    }

    counter += 1;
    const diffLabel = q.difficulty ? ` • ${DIFF_LABELS[q.difficulty] ?? q.difficulty}` : '';
    const bloomLabel = q.bloomLevel ? ` • ${q.bloomLevel}` : '';
    const pts = q.points != null ? ` • ${q.points} бод.` : '';
    const metaText = `${diffLabel}${bloomLabel}${pts}`.replace(/^ • /, '');

    // Question number + text
    paras.push(
      new Paragraph({
        children: [
          boldRun(`${counter}. `, INDIGO),
          new TextRun({ text: q.text ?? '', size: 22, color: '0F172A' }),
        ],
        spacing: { before: 100, after: 40 },
      })
    );

    // Meta badges (difficulty, bloom, points)
    if (metaText) {
      paras.push(
        new Paragraph({
          indent: { left: INDENT },
          children: [smallRun(metaText)],
          spacing: { after: 40 },
        })
      );
    }

    // Type-specific body
    paras.push(...renderQuestionBody(q));
    paras.push(emptyLine());
  }

  return paras;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Builds a docx Document instance from test data.
 *
 * @param {{ title?: string, subject?: string, grade?: string, teacher?: string, questions?: object[] }} testData
 * @returns {Document}
 */
export function buildTestDocx(testData) {
  const { title = 'Тест', subject = '', grade = '', teacher = '', questions = [] } = testData;

  const totalPoints = questions
    .filter((q) => q.type !== 'section' && q.points != null)
    .reduce((s, q) => s + (q.points ?? 0), 0);

  const metaParts = [subject, grade, teacher].filter(Boolean);
  if (totalPoints > 0) metaParts.push(`Вкупно: ${totalPoints} бод.`);

  const bodyParagraphs = buildParagraphs(questions);

  return new Document({
    creator: 'МакедоТест',
    title,
    description: metaParts.join(' · '),
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.2),
              right: convertInchesToTwip(1.2),
            },
          },
        },
        children: [
          // Document title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: title,
                bold: true,
                color: INDIGO,
                size: 36,
                underline: { type: UnderlineType.SINGLE, color: INDIGO },
              }),
            ],
            spacing: { after: 80 },
          }),

          // Meta line
          ...(metaParts.length
            ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [smallRun(metaParts.join('  ·  '))],
                  spacing: { after: 160 },
                  border: {
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
                  },
                }),
              ]
            : []),

          // Questions
          ...bodyParagraphs,
        ],
      },
    ],
  });
}

/**
 * Generates a .docx file and triggers a browser download.
 *
 * @param {{ title?: string, subject?: string, grade?: string, teacher?: string, questions?: object[] }} testData
 */
export async function downloadTestDocx(testData) {
  const { title = 'Тест' } = testData;
  const doc = buildTestDocx(testData);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
