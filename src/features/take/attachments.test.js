import { describe, expect, it, vi } from 'vitest';

const uploadBytesMock = vi.fn(async () => undefined);
const getDownloadUrlMock = vi.fn(async () => 'https://files.example/attachment.png');
const refMock = vi.fn((_storage, path) => ({ path }));

vi.mock('firebase/storage', () => ({
  ref: (...args) => refMock(...args),
  uploadBytes: (...args) => uploadBytesMock(...args),
  getDownloadURL: (...args) => getDownloadUrlMock(...args),
}));

vi.mock('../../lib/firebase', () => ({
  APP_ID: 'test-app',
  storage: {},
}));

import { buildAttachmentStoragePath, uploadHandwrittenAttachment } from './attachments';

describe('attachments helper', () => {
  it('builds deterministic storage path', () => {
    expect(
      buildAttachmentStoragePath({
        code: 'ABC123',
        questionId: 'q1',
        verificationId: 'VER123',
        fileName: 'my solution.png',
      })
    ).toBe('artifacts/test-app/publishedQuestionUploads/ABC123/q1/VER123/my_solution.png');
  });

  it('uploads attachment and returns metadata', async () => {
    const file = new File(['abc'], 'solution.png', { type: 'image/png' });
    const result = await uploadHandwrittenAttachment(file, {
      code: 'ABC123',
      questionId: 'q1',
      verificationId: 'VER123',
    });

    expect(uploadBytesMock).toHaveBeenCalledOnce();
    expect(result.downloadUrl).toBe('https://files.example/attachment.png');
    expect(result.storagePath).toContain('/ABC123/q1/VER123/');
  });
});
