import { describe, it, expect, beforeEach } from 'vitest';
import { useTestStore, createBlankQuestion } from './testStore.js';

const reset = () => useTestStore.getState().reset();

describe('createBlankQuestion', () => {
  it('креира multiple со 4 опции', () => {
    const q = createBlankQuestion('multiple');
    expect(q.type).toBe('multiple');
    expect(q.options).toHaveLength(4);
    expect(q.correct).toBe(0);
  });

  it('креира section со 0 поени', () => {
    const q = createBlankQuestion('section');
    expect(q.points).toBe(0);
  });
});

describe('useTestStore', () => {
  beforeEach(reset);

  it('почнува со празен тест', () => {
    expect(useTestStore.getState().test.questions).toEqual([]);
    expect(useTestStore.getState().totalPoints()).toBe(0);
  });

  it('addQuestion + updateQuestion + removeQuestion', () => {
    const id = useTestStore.getState().addQuestion('multiple');
    expect(useTestStore.getState().test.questions).toHaveLength(1);

    useTestStore.getState().updateQuestion(id, { text: 'Колку?', points: 5 });
    expect(useTestStore.getState().getQuestion(id).text).toBe('Колку?');
    expect(useTestStore.getState().totalPoints()).toBe(5);

    useTestStore.getState().removeQuestion(id);
    expect(useTestStore.getState().test.questions).toHaveLength(0);
  });

  it('duplicateQuestion вметнува точно по оригиналот', () => {
    const id1 = useTestStore.getState().addQuestion('multiple');
    useTestStore.getState().addQuestion('essay');
    const id2 = useTestStore.getState().duplicateQuestion(id1);
    const qs = useTestStore.getState().test.questions;
    expect(qs).toHaveLength(3);
    expect(qs[1].id).toBe(id2);
    expect(qs[1].type).toBe('multiple');
  });

  it('moveQuestion ги разменува соседите', () => {
    const a = useTestStore.getState().addQuestion('multiple');
    const b = useTestStore.getState().addQuestion('essay');
    useTestStore.getState().moveQuestion(b, 'up');
    expect(useTestStore.getState().test.questions.map((q) => q.id)).toEqual([b, a]);
  });

  it('importQuestions ги одбива невалидни задачи без да го промени state', () => {
    useTestStore.getState().addQuestion('multiple');
    const before = useTestStore.getState().test.questions.length;
    const res = useTestStore.getState().importQuestions([{ type: 'banana' }]);
    expect(res.ok).toBe(false);
    expect(useTestStore.getState().test.questions).toHaveLength(before);
  });

  it('importQuestions ги заменува валидните прашања по default', () => {
    useTestStore.getState().addQuestion('essay');
    const res = useTestStore
      .getState()
      .importQuestions([{ type: 'multiple', text: 'A?', options: ['x', 'y'], correct: 0 }]);
    expect(res.ok).toBe(true);
    expect(res.count).toBe(1);
    expect(useTestStore.getState().test.questions).toHaveLength(1);
  });

  it('importQuestions со append додава', () => {
    useTestStore.getState().addQuestion('essay');
    const res = useTestStore
      .getState()
      .importQuestions([{ type: 'multiple', text: 'A?', options: ['x', 'y'], correct: 0 }], {
        append: true,
      });
    expect(res.ok).toBe(true);
    expect(useTestStore.getState().test.questions).toHaveLength(2);
  });
});
