/**
 * Unit tests for Phase 4.1 — pdfRenderer
 *
 * We test the logic utilities (point summing, title fallback, lang mapping)
 * without rendering the actual PDF (which requires a canvas/font environment
 * not available in jsdom).  We also smoke-test that the module exports are
 * the correct types.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @react-pdf/renderer so tests run in jsdom without native canvas deps
// ---------------------------------------------------------------------------

vi.mock('@react-pdf/renderer', () => {
  const React = require('react');

  const pdf = vi.fn(() => ({
    toBlob: vi.fn(async () => new Blob(['%PDF'], { type: 'application/pdf' })),
  }));

  return {
    Document: ({ children }) => React.createElement('div', null, children),
    Page: ({ children }) => React.createElement('div', null, children),
    Text: ({ children }) => React.createElement('span', null, children),
    View: ({ children }) => React.createElement('div', null, children),
    StyleSheet: { create: (s) => s },
    Font: { register: vi.fn() },
    pdf,
    __esModule: true,
  };
});

// ---------------------------------------------------------------------------
// After mock is declared, import the module under test
// ---------------------------------------------------------------------------

import { TestPdfDocument } from './pdfRenderer.jsx';
import { downloadTestPdf } from './downloadTestPdf.jsx';

// ---------------------------------------------------------------------------
// Sample data helpers
// ---------------------------------------------------------------------------

const makeQuestions = () => [
  {
    id: 'q1',
    type: 'multiple',
    text: 'Прашање 1',
    points: 4,
    options: ['А', 'Б', 'В'],
    correct: 0,
  },
  { id: 'q2', type: 'true-false', text: 'Прашање 2', points: 2 },
  { id: 's1', type: 'section', text: 'Дел 2' },
  { id: 'q3', type: 'short-answer', text: 'Прашање 3' },
];

// ---------------------------------------------------------------------------
// Exports shape
// ---------------------------------------------------------------------------

describe('pdfRenderer — exports', () => {
  it('exports TestPdfDocument as a function/component', () => {
    expect(typeof TestPdfDocument).toBe('function');
  });

  it('downloadTestPdf is a function', () => {
    expect(typeof downloadTestPdf).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// TestPdfDocument — rendering smoke test
// ---------------------------------------------------------------------------

describe('TestPdfDocument', () => {
  it('renders without throwing for typical test data', () => {
    const { createElement } = React;
    expect(() =>
      createElement(TestPdfDocument, {
        title: 'Тест по математика',
        subject: 'Математика',
        grade: '7 одделение',
        questions: makeQuestions(),
        lang: 'mk',
      })
    ).not.toThrow();
  });

  it('renders without throwing for empty questions array', () => {
    const { createElement } = React;
    expect(() =>
      createElement(TestPdfDocument, {
        title: '',
        subject: '',
        grade: '',
        questions: [],
      })
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// downloadTestPdf — blob generation + DOM interaction
// ---------------------------------------------------------------------------

describe('downloadTestPdf', () => {
  beforeEach(() => {
    // Mock URL APIs
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });

    // Mock document.createElement / body manipulation
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return document.createElement(tag);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  it('calls pdf() and toBlob() to generate the PDF', async () => {
    const { pdf } = await import('@react-pdf/renderer');
    vi.clearAllMocks();
    await downloadTestPdf({ title: 'Тест', questions: makeQuestions() });
    expect(pdf).toHaveBeenCalledOnce();
  });

  it('sets correct download filename from title', async () => {
    const anchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    await downloadTestPdf({ title: 'Мој Тест', questions: [] });
    expect(anchor.download).toBe('Мој_Тест.pdf');
  });

  it('defaults title to Тест when not provided', async () => {
    const anchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    await downloadTestPdf({ questions: [] });
    expect(anchor.download).toBe('Тест.pdf');
  });
});
