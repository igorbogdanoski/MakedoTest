import { describe, it, expect } from 'vitest';
import { QUESTION_TYPES, QuestionSchema, parseQuestionList, parseTest } from './schema.js';

describe('domain schema', () => {
  it('експортира 16 типови', () => {
    expect(QUESTION_TYPES).toHaveLength(16);
  });

  it('валидира multiple choice прашање', () => {
    const q = {
      type: 'multiple',
      text: 'Колку е 2+2?',
      options: ['3', '4', '5'],
      correct: 1,
    };
    expect(QuestionSchema.safeParse(q).success).toBe(true);
  });

  it('одбива multiple без options', () => {
    const q = { type: 'multiple', text: 'X', correct: 0 };
    expect(QuestionSchema.safeParse(q).success).toBe(false);
  });

  it('валидира true-false', () => {
    expect(
      QuestionSchema.safeParse({ type: 'true-false', text: 'Земјата е тркалезна.', correct: 0 })
        .success
    ).toBe(true);
  });

  it('одбива true-false со невалиден correct', () => {
    expect(QuestionSchema.safeParse({ type: 'true-false', text: 'X', correct: 5 }).success).toBe(
      false
    );
  });

  it('валидира checklist со повеќе точни', () => {
    const q = {
      type: 'checklist',
      text: 'Избери ги парните',
      options: ['1', '2', '3', '4'],
      corrects: [1, 3],
    };
    expect(QuestionSchema.safeParse(q).success).toBe(true);
  });

  it('валидира diagram со geogebra embed', () => {
    const q = {
      type: 'diagram',
      text: 'Истражи ја функцијата',
      embedType: 'geogebra',
      embedUrl: 'https://www.geogebra.org/m/abc123',
    };
    expect(QuestionSchema.safeParse(q).success).toBe(true);
  });

  it('валидира response policy за open question', () => {
    const q = {
      type: 'essay',
      text: 'Објасни ја постапката',
      responseConfig: {
        allowMathEditor: true,
        allowHandwrittenUpload: true,
        requireQrForAttachment: true,
      },
    };
    expect(QuestionSchema.safeParse(q).success).toBe(true);
  });

  it('parseQuestionList ја прифаќа AI JSON низата', () => {
    const list = [
      { type: 'multiple', text: 'A?', options: ['x', 'y'], correct: 0 },
      { type: 'section', text: 'ДЕЛ I' },
      { type: 'essay', text: 'Опиши...' },
    ];
    const res = parseQuestionList(list);
    expect(res.success).toBe(true);
    if (res.success) expect(res.data).toHaveLength(3);
  });

  it('parseTest валидира тест објект со default questions', () => {
    const res = parseTest({ title: 'Тест по математика' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.questions).toEqual([]);
      expect(res.data.language).toBe('mk');
    }
  });

  it('одбива непознат type', () => {
    expect(QuestionSchema.safeParse({ type: 'banana', text: 'x' }).success).toBe(false);
  });
});
