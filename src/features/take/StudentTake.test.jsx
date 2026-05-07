import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import StudentTake from './StudentTake.jsx';
import { requestServerSignedProof } from './proofClient';
import { uploadHandwrittenAttachment } from './attachments';
import {
  activateAttachmentSession,
  createAttachmentSession,
  savePublishedAttempt,
  saveQuestionAttachmentRecord,
} from './publish';

async function clickWithAct(user, target) {
  await act(async () => {
    await user.click(target);
  });
}

async function keyboardWithAct(user, keys) {
  await act(async () => {
    await user.keyboard(keys);
  });
}

async function uploadWithAct(user, input, file) {
  await act(async () => {
    await user.upload(input, file);
  });
}

vi.mock('../../components/RenderContent', () => ({
  default: ({ text }) => <span>{text}</span>,
}));

vi.mock('./proofClient', () => ({
  requestServerSignedProof: vi.fn(async (payload) => ({
    signature: `sig-${payload.questionId || 'submission'}`,
    verificationId: (payload.questionId || 'SUBMISSION').toUpperCase().slice(0, 12),
  })),
}));

vi.mock('./attachments', () => ({
  uploadHandwrittenAttachment: vi.fn(async (file, ctx) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    storagePath: `uploads/${ctx.code}/${ctx.questionId}/${ctx.verificationId}/${file.name}`,
    downloadUrl: `https://files.example/${file.name}`,
  })),
}));

vi.mock('./publish', async () => {
  const actual = await vi.importActual('./publish');
  return {
    ...actual,
    createAttachmentSession: vi.fn(async () => ({ ok: true })),
    activateAttachmentSession: vi.fn(async () => ({ ok: true })),
    saveQuestionAttachmentRecord: vi.fn(async () => ({ ok: true })),
    savePublishedAttempt: vi.fn(async () => ({ ok: true, attemptId: 'ATTEMPT1' })),
  };
});

const baseTest = {
  id: 't1',
  title: 'Тест по математика',
  language: 'mk',
  questions: [
    {
      id: 'q1',
      type: 'multiple',
      text: '2+2=?',
      options: ['3', '4', '5'],
      correct: 1,
      points: 2,
    },
    { id: 'q2', type: 'true-false', text: 'Земјата е тркалезна', correct: 0, points: 1 },
  ],
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('StudentTake', () => {
  it('прикажува наслов и прашања', () => {
    render(<StudentTake test={baseTest} />);
    expect(screen.getByText('Тест по математика')).toBeInTheDocument();
    expect(screen.getByText('2+2=?')).toBeInTheDocument();
    expect(screen.getByText('Земјата е тркалезна')).toBeInTheDocument();
  });

  it('напредокот се ажурира на одговор', async () => {
    const user = userEvent.setup();
    render(<StudentTake test={baseTest} />);
    expect(screen.getByText('0 / 2 одговорени')).toBeInTheDocument();
    await clickWithAct(user, screen.getByLabelText('4'));
    expect(await screen.findByText('1 / 2 одговорени')).toBeInTheDocument();
  });

  it('auto-grading прикажува точен скор', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StudentTake test={baseTest} code="ABC123" onSubmit={onSubmit} />);
    await clickWithAct(user, screen.getByLabelText('4'));
    await clickWithAct(user, screen.getByLabelText('Точно'));
    await clickWithAct(user, screen.getByText('Заврши и испрати'));

    expect(await screen.findByText('Тестот е завршен')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
    const arg = onSubmit.mock.calls[0][0];
    expect(arg.result.earned).toBe(3);
    expect(arg.result.max).toBe(3);
  });

  it('partial скор', async () => {
    const user = userEvent.setup();
    render(<StudentTake test={baseTest} />);
    await clickWithAct(user, screen.getByLabelText('5')); // погрешно
    await clickWithAct(user, screen.getByLabelText('Точно')); // точно
    await clickWithAct(user, screen.getByText('Заврши и испрати'));
    // 1 од 3 поени = 33.3%
    expect(await screen.findByText('33.3%')).toBeInTheDocument();
  });

  it('persists draft на localStorage по code', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<StudentTake test={baseTest} code="XYZ789" />);
    await clickWithAct(user, screen.getByLabelText('4'));
    await screen.findByText('1 / 2 одговорени');
    unmount();

    render(<StudentTake test={baseTest} code="XYZ789" />);
    // Прогресот треба да е зачуван
    expect(screen.getByText('1 / 2 одговорени')).toBeInTheDocument();
  });

  it('hydrates from initialResponses when local draft is empty', () => {
    render(<StudentTake test={baseTest} code="RESUME1" initialResponses={{ q1: 1 }} />);
    expect(screen.getByText('1 / 2 одговорени')).toBeInTheDocument();
  });

  it('реагира на празни одговори без crash', () => {
    render(<StudentTake test={{ ...baseTest, questions: [] }} />);
    expect(screen.getByText('0 / 0 одговорени')).toBeInTheDocument();
  });

  it('section прашања не се бројат во прогрес', () => {
    const test = {
      ...baseTest,
      questions: [{ id: 's1', type: 'section', text: 'ДЕЛ I' }, baseTest.questions[0]],
    };
    render(<StudentTake test={test} />);
    expect(screen.getByText('0 / 1 одговорени')).toBeInTheDocument();
    expect(screen.getByText('ДЕЛ I')).toBeInTheDocument();
  });

  it('checklist дозволува повеќе избори', async () => {
    const user = userEvent.setup();
    const test = {
      ...baseTest,
      questions: [
        {
          id: 'c1',
          type: 'checklist',
          text: 'Избери парни',
          options: ['1', '2', '3', '4'],
          corrects: [1, 3],
          points: 2,
        },
      ],
    };
    render(<StudentTake test={test} />);
    await clickWithAct(user, screen.getByLabelText('2'));
    await clickWithAct(user, screen.getByLabelText('4'));
    await clickWithAct(user, screen.getByText('Заврши и испрати'));
    expect(await screen.findByText('100%')).toBeInTheDocument();
  });

  it('manual одговор поддржува математички toolbar', async () => {
    const user = userEvent.setup();
    const test = {
      ...baseTest,
      questions: [
        {
          id: 'sa1',
          type: 'short-answer',
          text: 'Внеси формула',
          points: 1,
          responseConfig: { allowMathEditor: true },
        },
      ],
    };
    render(<StudentTake test={test} />);

    await clickWithAct(user, screen.getByText('Математички едитор'));
    await clickWithAct(user, screen.getByText('frac'));

    expect(screen.getByPlaceholderText('Твојот одговор...')).toHaveValue('$\\frac{}{}$');
  });

  it('teacher може да го исклучи математичкиот едитор', () => {
    const test = {
      ...baseTest,
      questions: [
        {
          id: 'sa2',
          type: 'short-answer',
          text: 'Само текст',
          points: 1,
          responseConfig: { allowMathEditor: false },
        },
      ],
    };
    render(<StudentTake test={test} />);
    expect(screen.queryByText('Математички едитор')).not.toBeInTheDocument();
  });

  it('open прашање поддржува teacher-enabled QR gated attachment и QR proof по submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const test = {
      ...baseTest,
      questions: [
        {
          id: 'e1',
          type: 'essay',
          text: 'Реши ја задачата',
          points: 5,
          responseConfig: {
            allowMathEditor: true,
            allowHandwrittenUpload: true,
            requireQrForAttachment: true,
          },
        },
      ],
    };

    const { container } = render(<StudentTake test={test} code="HAND1" onSubmit={onSubmit} />);
    await clickWithAct(user, screen.getByText('Отвори QR за прикачување'));
    expect(await screen.findByText(/Скенирај го QR кодот/)).toBeInTheDocument();
    expect(screen.getByAltText('QR код за прикачување решение за оваа задача')).toBeInTheDocument();

    await clickWithAct(user, screen.getByText('Го скенирав QR кодот'));

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();

    const file = new File(['handwritten'], 'solution.png', { type: 'image/png' });
    await uploadWithAct(user, fileInput, file);

    expect(await screen.findByText(/Прикачено: solution.png/)).toBeInTheDocument();
    expect(screen.getByText('1 / 1 одговорени')).toBeInTheDocument();

    await clickWithAct(user, screen.getByText('Заврши и испрати'));
    expect(await screen.findByText(/Verification ID:/)).toBeInTheDocument();
    expect(
      screen.getByAltText('QR код за верификација на предадениот одговор')
    ).toBeInTheDocument();

    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.attachments.e1.attachment.name).toBe('solution.png');
    expect(submitted.submissionProof.verificationId).toBeTruthy();
    expect(requestServerSignedProof).toHaveBeenCalled();
    expect(createAttachmentSession).toHaveBeenCalled();
    expect(activateAttachmentSession).toHaveBeenCalled();
    expect(uploadHandwrittenAttachment).toHaveBeenCalled();
    expect(saveQuestionAttachmentRecord).toHaveBeenCalled();
    expect(savePublishedAttempt).toHaveBeenCalled();
  });
});

describe('StudentTake — keyboard a11y', () => {
  it('може да се одговара со tab + space', async () => {
    const user = userEvent.setup();
    render(<StudentTake test={baseTest} />);
    const radio = screen.getByLabelText('4');
    radio.focus();
    await keyboardWithAct(user, '[Space]');
    await waitFor(() => expect(radio).toBeChecked());
  });
});
