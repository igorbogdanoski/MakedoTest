/**
 * downloadTestPdf — async helper that generates a PDF blob and triggers a browser download.
 * Kept in a separate file from pdfRenderer.jsx to satisfy react-refresh/only-export-components.
 */

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { TestPdfDocument } from './pdfRenderer.jsx';

/**
 * @param {{ title?: string, subject?: string, grade?: string, questions: object[], lang?: string }} testData
 */
export async function downloadTestPdf(testData) {
  const { title = 'Тест', subject = '', grade = '', questions = [], lang = 'mk' } = testData;

  const doc = (
    <TestPdfDocument
      title={title}
      subject={subject}
      grade={grade}
      questions={questions}
      lang={lang}
    />
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
