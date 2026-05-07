/**
 * Phase 4.1 — pixel-perfect PDF export via @react-pdf/renderer.
 *
 * Exports:
 *   TestPdfDocument  — React-PDF Document component (can be used with BlobProvider/PDFDownloadLink)
 *   downloadTestPdf  — async helper: generates PDF blob and triggers browser download
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 48,
    color: '#1e293b',
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#6366f1',
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5',
    marginBottom: 2,
  },
  headerMeta: {
    fontSize: 8,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 4,
  },
  questionWrapper: {
    marginBottom: 14,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  questionNumber: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6366f1',
    textTransform: 'uppercase',
  },
  questionPoints: {
    fontSize: 8,
    color: '#64748b',
  },
  questionText: {
    fontSize: 10,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    marginBottom: 6,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  optionBullet: {
    width: 14,
    fontSize: 9,
    color: '#475569',
  },
  optionText: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.4,
  },
  blankLine: {
    marginTop: 4,
    marginBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#94a3b8',
    height: 14,
  },
  tableWrapper: {
    marginTop: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
    padding: 4,
    borderRightWidth: 0.5,
    borderRightColor: '#cbd5e1',
  },
  tableCellHeader: {
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f1f5f9',
  },
  matchRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  matchLeft: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
  },
  matchRight: {
    flex: 1,
    fontSize: 9,
    color: '#64748b',
    textAlign: 'right',
  },
  answerBox: {
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: '#94a3b8',
    borderRadius: 3,
    minHeight: 40,
    padding: 4,
    backgroundColor: '#ffffff',
  },
  difficultyBadge: {
    fontSize: 7,
    color: '#ffffff',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  bloomBadge: {
    fontSize: 7,
    color: '#6d28d9',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
    marginLeft: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 4,
  },
});

// ---------------------------------------------------------------------------
// Difficulty badge colour
// ---------------------------------------------------------------------------

const DIFF_COLORS = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const ALPHA_OPTIONS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З'];

// ---------------------------------------------------------------------------
// Per-type question body renderers
// ---------------------------------------------------------------------------

function QuestionBody({ q }) {
  const { type } = q;

  if (type === 'section') {
    return <Text style={styles.sectionLabel}>{q.text}</Text>;
  }

  if (type === 'multiple' || type === 'checklist') {
    const options = q.options ?? [];
    return (
      <View>
        {options.map((opt, i) => (
          <View key={i} style={styles.optionRow}>
            <Text style={styles.optionBullet}>{ALPHA_OPTIONS[i] ?? `${i + 1}.`}</Text>
            <Text style={styles.optionText}>{opt}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'true-false') {
    return (
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>☐ Точно ☐ Неточно</Text>
      </View>
    );
  }

  if (type === 'fill-blanks') {
    const parts = (q.text ?? '').split('___');
    return (
      <View>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part ? <Text style={styles.questionText}>{part}</Text> : null}
            {i < parts.length - 1 ? <View style={styles.blankLine} /> : null}
          </React.Fragment>
        ))}
      </View>
    );
  }

  if (type === 'matching' || type === 'multi-match') {
    const pairs = q.pairs ?? q.options ?? [];
    return (
      <View>
        {pairs.map((pair, i) => {
          const left = typeof pair === 'object' ? (pair.left ?? pair.question ?? '') : pair;
          const right = typeof pair === 'object' ? (pair.right ?? pair.answer ?? '___') : '___';
          return (
            <View key={i} style={styles.matchRow}>
              <Text style={styles.matchLeft}>
                {i + 1}. {left}
              </Text>
              <Text style={styles.matchRight}>{right}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  if (type === 'ordering') {
    const items = q.items ?? q.options ?? [];
    return (
      <View>
        {items.map((item, i) => (
          <View key={i} style={styles.optionRow}>
            <Text style={styles.optionBullet}>{i + 1}.</Text>
            <Text style={styles.optionText}>{typeof item === 'string' ? item : item.text}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'table') {
    const headers = q.headers ?? [];
    const rows = q.rows ?? [];
    return (
      <View style={styles.tableWrapper}>
        {headers.length > 0 && (
          <View style={styles.tableRow}>
            {headers.map((h, i) => (
              <Text key={i} style={[styles.tableCell, styles.tableCellHeader]}>
                {h}
              </Text>
            ))}
          </View>
        )}
        {rows.map((row, ri) => (
          <View key={ri} style={styles.tableRow}>
            {(Array.isArray(row) ? row : []).map((cell, ci) => (
              <Text key={ci} style={styles.tableCell}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (type === 'statements') {
    const statements = q.statements ?? [];
    return (
      <View>
        {statements.map((stmt, i) => (
          <View key={i} style={styles.optionRow}>
            <Text style={styles.optionBullet}>{i + 1}.</Text>
            <Text style={styles.optionText}>{typeof stmt === 'string' ? stmt : stmt.text}</Text>
            <Text style={{ fontSize: 9, color: '#94a3b8', marginLeft: 8 }}>☐ Т ☐ Н</Text>
          </View>
        ))}
      </View>
    );
  }

  // short-answer, list, essay, diagram, multi-part, selection — show answer box
  return <View style={styles.answerBox} />;
}

// ---------------------------------------------------------------------------
// Single question card
// ---------------------------------------------------------------------------

function QuestionCard({ q, index }) {
  const isSect = q.type === 'section';
  if (isSect) {
    return <QuestionBody q={q} />;
  }

  const diffColor = DIFF_COLORS[q.difficulty] ?? '#94a3b8';

  return (
    <View style={styles.questionWrapper} wrap={false}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Прашање {index}</Text>
        {q.points != null && <Text style={styles.questionPoints}>{q.points} бод.</Text>}
      </View>
      <Text style={styles.questionText}>{q.text}</Text>
      <View style={styles.badgeRow}>
        {q.difficulty && (
          <Text style={[styles.difficultyBadge, { backgroundColor: diffColor }]}>
            {q.difficulty}
          </Text>
        )}
        {q.bloomLevel && <Text style={styles.bloomBadge}>{q.bloomLevel}</Text>}
      </View>
      <QuestionBody q={q} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

/**
 * @param {{ title: string, subject: string, grade: string, questions: object[], lang?: string }} props
 */
export function TestPdfDocument({ title, subject, grade, questions, lang = 'mk' }) {
  const date = new Date().toLocaleDateString(lang === 'sq' ? 'sq-AL' : 'mk-MK');
  const totalPoints = questions
    .filter((q) => q.type !== 'section' && q.points != null)
    .reduce((s, q) => s + (q.points ?? 0), 0);

  let counter = 0;

  return (
    <Document title={title} author="МакедоТест" creator="МакедоТест v4.1">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>{title || 'Тест'}</Text>
          <Text style={styles.headerMeta}>
            {[subject, grade, date, totalPoints > 0 ? `Вкупно: ${totalPoints} бод.` : null]
              .filter(Boolean)
              .join('  ·  ')}
          </Text>
        </View>

        {/* Questions */}
        {questions.map((q, idx) => {
          if (q.type !== 'section') counter += 1;
          const num = counter;
          return <QuestionCard key={q.id ?? idx} q={q} index={num} />;
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>МакедоТест</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
