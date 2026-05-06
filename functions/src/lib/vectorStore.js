/**
 * Firestore-backed vector store.
 *
 * Collection layout:
 *   rag_vectors/{namespace}/docs/{docId}
 *     id:          string
 *     text:        string
 *     embedding:   number[]   (stored as a JSON array)
 *     metadata:    object
 *     indexedAt:   string (ISO-8601)
 *
 * All reads/writes use the Firebase Admin SDK (server-side only).
 */

import { getFirestore } from 'firebase-admin/firestore';

const ROOT_COLLECTION = 'rag_vectors';

/**
 * Upsert a batch of vector documents into a namespace.
 *
 * @param {string} namespace
 * @param {Array<{id: string, text: string, embedding: number[], metadata?: object}>} docs
 * @returns {Promise<number>} count of documents upserted
 */
export async function upsertVectors(namespace, docs) {
  const db = getFirestore();
  const colRef = db.collection(ROOT_COLLECTION).doc(namespace).collection('docs');

  const indexedAt = new Date().toISOString();

  // Firestore batched writes support max 500 operations per batch.
  const BATCH_SIZE = 400;
  let upserted = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = docs.slice(i, i + BATCH_SIZE);

    for (const doc of slice) {
      const ref = colRef.doc(sanitiseDocId(doc.id));
      batch.set(ref, {
        id: doc.id,
        text: doc.text,
        embedding: doc.embedding,
        metadata: doc.metadata ?? {},
        indexedAt,
      });
    }

    await batch.commit();
    upserted += slice.length;
  }

  return upserted;
}

/**
 * Fetch all vector documents for a namespace.
 *
 * @param {string} namespace
 * @returns {Promise<Array<{id, text, embedding, metadata, indexedAt}>>}
 */
export async function fetchAllVectors(namespace) {
  const db = getFirestore();
  const snapshot = await db.collection(ROOT_COLLECTION).doc(namespace).collection('docs').get();

  return snapshot.docs.map((d) => d.data());
}

/**
 * Sanitise a document ID so Firestore accepts it.
 * Firestore doc IDs must not contain `/` and should not be empty.
 */
function sanitiseDocId(id) {
  return String(id).replace(/\//g, '_').replace(/\s+/g, '-').slice(0, 1500) || '_';
}
