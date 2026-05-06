import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Question from './Question.jsx';
import { queryRag } from '../features/rag/ragClient';

vi.mock('../features/rag/ragClient', () => ({
  queryRag: vi.fn(),
}));

function renderQuestionEditor(initialQuestion) {
  function Harness() {
    const [questions, setQuestions] = useState([initialQuestion]);
    return (
      <Question
        q={questions[0]}
        idx={0}
        view="editor"
        testInfo={{
          subNumbering: false,
          alignment: 'left',
          layout: 'single',
        }}
        questions={questions}
        setQuestions={setQuestions}
        saveToBank={() => {}}
        showHelp={null}
        setShowHelp={() => {}}
        helpContent={{}}
        randomizeAnswers={() => {}}
        duplicates={[]}
        moveQuestion={() => {}}
      />
    );
  }

  return render(<Harness />);
}

describe('Question RAG editor flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_RAG_ENABLED', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows validation message when question text is empty', async () => {
    renderQuestionEditor({
      id: 'q1',
      type: 'multiple',
      text: '',
      points: 5,
      options: ['A', 'B'],
      correct: 0,
    });

    const refreshBtn = screen.getByRole('button', { name: 'Освежи' });
    fireEvent.click(refreshBtn);

    expect(await screen.findByText(/Внесете текст на задачата/i)).toBeInTheDocument();
    expect(queryRag).not.toHaveBeenCalled();
  });

  it('refreshes and inserts RAG hints into question text', async () => {
    vi.mocked(queryRag).mockResolvedValue([
      {
        id: 'c-1',
        metadata: {
          conceptTitle: 'Линеарни функции',
          topicTitle: 'Алгебра',
          gradeLevel: 8,
          track: 'primary',
          assessmentStandards: ['Гради и решава линеарни модели'],
        },
      },
    ]);

    renderQuestionEditor({
      id: 'q2',
      type: 'multiple',
      text: 'Реши равенка.',
      points: 5,
      options: ['A', 'B'],
      correct: 0,
    });

    const refreshBtn = screen.getByRole('button', { name: 'Освежи' });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(queryRag).toHaveBeenCalledWith({
        query: 'Реши равенка.',
        topK: 3,
        timeoutMs: 12000,
      });
    });

    expect(await screen.findByText(/Линеарни функции/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Вметни насоки' }));

    const textarea = screen.getByPlaceholderText('Внесете задача...');
    expect(textarea.value).toContain('Насоки од наставна програма:');
    expect(textarea.value).toContain('Линеарни функции');
  });

  it('allows manual Bloom level selection', async () => {
    renderQuestionEditor({
      id: 'q3',
      type: 'multiple',
      text: 'Објасни ја равенката.',
      points: 5,
      options: ['A', 'B'],
      correct: 0,
    });

    const bloomSelect = screen.getByRole('combobox', { name: /bloom level/i });
    await act(async () => {
      fireEvent.change(bloomSelect, { target: { value: 'analyze' } });
    });

    expect(bloomSelect).toHaveValue('analyze');
  });
});
