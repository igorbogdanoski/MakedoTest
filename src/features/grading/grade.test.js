import { describe, it, expect } from 'vitest';
import { gradeQuestion, gradeTest, percentageToGrade, DEFAULT_GRADING_SCALE } from './grade.js';

describe('gradeQuestion — multiple', () => {
  const q = { id: 'q1', type: 'multiple', points: 2, options: ['a', 'b', 'c'], correct: 1 };
  it('точно → полни поени', () => {
    expect(gradeQuestion(q, 1)).toMatchObject({ earned: 2, max: 2, correct: true });
  });
  it('погрешно → 0', () => {
    expect(gradeQuestion(q, 0)).toMatchObject({ earned: 0, correct: false });
  });
  it('без одговор → 0', () => {
    expect(gradeQuestion(q, undefined)).toMatchObject({ earned: 0 });
  });
});

describe('gradeQuestion — true-false', () => {
  const q = { id: 'q', type: 'true-false', points: 1, correct: 0 };
  it('точно', () => expect(gradeQuestion(q, 0).correct).toBe(true));
  it('погрешно', () => expect(gradeQuestion(q, 1).correct).toBe(false));
});

describe('gradeQuestion — checklist', () => {
  const q = {
    id: 'q',
    type: 'checklist',
    points: 4,
    options: ['a', 'b', 'c', 'd'],
    corrects: [0, 2],
  };
  it('сите точни без погрешни → max', () => {
    expect(gradeQuestion(q, [0, 2]).earned).toBe(4);
  });
  it('партијален кредит', () => {
    expect(gradeQuestion(q, [0]).earned).toBe(2);
  });
  it('казна за погрешен', () => {
    const r = gradeQuestion(q, [0, 1]);
    expect(r.earned).toBe(0); // 1 hit - 1 wrong = 0
  });
  it('негативно clamped на 0', () => {
    expect(gradeQuestion(q, [1, 3]).earned).toBe(0);
  });
});

describe('gradeQuestion — matching', () => {
  const q = {
    id: 'q',
    type: 'matching',
    points: 3,
    pairs: [
      { left: 'A', right: '1' },
      { left: 'B', right: '2' },
      { left: 'C', right: '3' },
    ],
  };
  it('сите точни', () => {
    expect(
      gradeQuestion(q, [
        { left: 'A', right: '1' },
        { left: 'B', right: '2' },
        { left: 'C', right: '3' },
      ]).correct
    ).toBe(true);
  });
  it('1 од 3', () => {
    const r = gradeQuestion(q, [{ left: 'A', right: '1' }]);
    expect(r.earned).toBe(1);
  });
});

describe('gradeQuestion — ordering', () => {
  const q = { id: 'q', type: 'ordering', points: 4, items: ['прво', 'второ', 'трето', 'четврто'] };
  it('целосно точно', () => {
    expect(gradeQuestion(q, ['прво', 'второ', 'трето', 'четврто']).earned).toBe(4);
  });
  it('половина точно', () => {
    expect(gradeQuestion(q, ['прво', 'второ', 'X', 'X']).earned).toBe(2);
  });
});

describe('gradeQuestion — statements', () => {
  const q = {
    id: 'q',
    type: 'statements',
    points: 2,
    items: [
      { s: 'A', correct: 0 },
      { s: 'B', correct: 1 },
    ],
  };
  it('двете точни', () => expect(gradeQuestion(q, [0, 1]).correct).toBe(true));
  it('едно точно', () => expect(gradeQuestion(q, [0, 0]).earned).toBe(1));
});

describe('gradeQuestion — manual types', () => {
  it.each(['essay', 'short-answer', 'fill-blanks', 'list', 'diagram', 'table'])(
    '%s бара рачно',
    (type) => {
      expect(gradeQuestion({ id: 'q', type, points: 5 }, 'нешто').requiresManual).toBe(true);
    }
  );
});

describe('gradeQuestion — section', () => {
  it('не носи поени', () => {
    expect(gradeQuestion({ id: 'q', type: 'section', points: 0 }, null)).toMatchObject({
      max: 0,
      earned: 0,
    });
  });
});

describe('gradeTest', () => {
  const test = {
    questions: [
      { id: 'a', type: 'multiple', points: 2, options: ['x', 'y'], correct: 0 },
      { id: 'b', type: 'true-false', points: 1, correct: 1 },
      { id: 'c', type: 'essay', points: 5 },
    ],
  };
  it('зема earned + max + проценти', () => {
    const r = gradeTest(test, { a: 0, b: 1 });
    expect(r.earned).toBe(3);
    expect(r.max).toBe(8);
    expect(r.percentage).toBe(37.5);
    expect(r.requiresManual).toBe(true);
  });

  it('празни одговори → 0', () => {
    const r = gradeTest(test, {});
    expect(r.earned).toBe(0);
  });
});

describe('percentageToGrade', () => {
  it('95% → 5', () => expect(percentageToGrade(95).grade).toBe(5));
  it('80% → 4', () => expect(percentageToGrade(80).grade).toBe(4));
  it('65% → 3', () => expect(percentageToGrade(65).grade).toBe(3));
  it('55% → 2', () => expect(percentageToGrade(55).grade).toBe(2));
  it('30% → 1', () => expect(percentageToGrade(30).grade).toBe(1));
  it('respects custom scale', () => {
    const scale = [
      { min: 50, grade: 'pass', label: 'P' },
      { min: 0, grade: 'fail', label: 'F' },
    ];
    expect(percentageToGrade(60, scale).grade).toBe('pass');
    expect(percentageToGrade(40, scale).grade).toBe('fail');
  });
  it('default scale има 5 нивоа', () => expect(DEFAULT_GRADING_SCALE).toHaveLength(5));
});
