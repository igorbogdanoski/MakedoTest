import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { APP_ID, storage } from '../../lib/firebase';

function sanitizeFileName(name) {
  return String(name || 'attachment').replace(/[^A-Za-z0-9._-]/g, '_');
}

export function buildAttachmentStoragePath({ code, questionId, verificationId, fileName }) {
  return `artifacts/${APP_ID}/publishedQuestionUploads/${code}/${questionId}/${verificationId}/${sanitizeFileName(fileName)}`;
}

export async function uploadHandwrittenAttachment(file, { code, questionId, verificationId }) {
  const storagePath = buildAttachmentStoragePath({
    code,
    questionId,
    verificationId,
    fileName: file?.name,
  });

  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, {
    contentType: file?.type || 'application/octet-stream',
    customMetadata: {
      code: String(code || ''),
      questionId: String(questionId || ''),
      verificationId: String(verificationId || ''),
    },
  });

  const downloadUrl = await getDownloadURL(storageRef);
  return {
    storagePath,
    downloadUrl,
    name: file?.name || 'attachment',
    size: Number(file?.size || 0),
    type: file?.type || 'application/octet-stream',
    lastModified: Number(file?.lastModified || 0),
  };
}
