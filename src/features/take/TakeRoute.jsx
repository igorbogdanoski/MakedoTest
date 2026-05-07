/**
 * TakeRoute — container за public student-take linkovi.
 *
 * Одговорности:
 *   • Чита `code` од URL преку `resolveTakeRoute`.
 *   • Вчитува тест од Firestore преку `loadPublishedTest`.
 *   • Рендерира loading / error / `StudentTake` соодветно.
 *   • Никаков editor state (целосно изолиран од `App`).
 */

import { useEffect, useState } from 'react';
import StudentTake from './StudentTake';
import {
  loadPublishedTest,
  loadResumeState,
  saveResumeState,
  subscribeQuestionAttachments,
} from './publish';

export default function TakeRoute({ code, resumeToken = null }) {
  const [state, setState] = useState({
    status: 'loading',
    test: null,
    error: null,
    resumeResponses: null,
    resumeWarning: null,
    remoteAttachmentByQuestion: {},
  });

  useEffect(() => {
    let cancelled = false;
    setState({
      status: 'loading',
      test: null,
      error: null,
      resumeResponses: null,
      resumeWarning: null,
      remoteAttachmentByQuestion: {},
    });
    loadPublishedTest(code).then(async (res) => {
      if (cancelled) return;
      if (res.ok) {
        if (resumeToken) {
          const resume = await loadResumeState({ code, resumeToken });
          if (cancelled) return;
          if (resume.ok) {
            setState({
              status: 'ready',
              test: res.data.test,
              error: null,
              resumeResponses: resume.data.responses,
              resumeWarning: null,
              remoteAttachmentByQuestion: {},
            });
          } else {
            setState({
              status: 'ready',
              test: res.data.test,
              error: null,
              resumeResponses: null,
              resumeWarning: resume.error,
              remoteAttachmentByQuestion: {},
            });
          }
          return;
        }
        setState({
          status: 'ready',
          test: res.data.test,
          error: null,
          resumeResponses: null,
          resumeWarning: null,
          remoteAttachmentByQuestion: {},
        });
      } else {
        setState({
          status: 'error',
          test: null,
          error: res,
          resumeResponses: null,
          resumeWarning: null,
          remoteAttachmentByQuestion: {},
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, resumeToken]);

  useEffect(() => {
    const unsubscribe = subscribeQuestionAttachments(
      code,
      (byQuestion) => {
        setState((prev) => ({ ...prev, remoteAttachmentByQuestion: byQuestion }));
      },
      () => {}
    );

    return () => unsubscribe();
  }, [code]);

  const handleSaveResume = async (responses, currentToken = null) => {
    const save = await saveResumeState({
      code,
      responses,
      resumeToken: currentToken,
    });
    return save;
  };

  if (state.status === 'loading') {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="card p-6 text-center">
          <p className="text-ink-muted">Вчитување на тест „{code}“…</p>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    const { error } = state;
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="card p-6 text-center">
          <h1 className="text-xl font-semibold text-ink">Тестот не може да се отвори</h1>
          <p className="mt-2 text-ink-muted">{error?.error ?? 'Непозната грешка.'}</p>
          <a href="/" className="btn-ghost mt-4 inline-flex">
            Назад
          </a>
        </div>
      </main>
    );
  }

  return (
    <StudentTake
      test={state.test}
      code={code}
      initialResponses={state.resumeResponses}
      initialResumeToken={resumeToken}
      resumeWarning={state.resumeWarning}
      remoteAttachmentByQuestion={state.remoteAttachmentByQuestion}
      onSaveResume={handleSaveResume}
    />
  );
}
