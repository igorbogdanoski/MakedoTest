const DB_NAME = 'makedotest-offline';
const STORE_NAME = 'drafts';
const DB_VERSION = 1;

function hasIndexedDb() {
  return typeof indexedDB !== 'undefined';
}

function openDb() {
  if (!hasIndexedDb()) return Promise.resolve(null);

  return new Promise((resolve) => {
    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

function txPromise(tx) {
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
    tx.onabort = () => resolve(false);
  });
}

export async function readDraftIndexedDb(key) {
  if (!key) return null;
  const db = await openDb();
  if (!db) return null;

  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);

    const value = await new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
    await txPromise(tx);
    return value;
  } catch {
    return null;
  } finally {
    db.close();
  }
}

export async function writeDraftIndexedDb(key, value) {
  if (!key) return false;
  const db = await openDb();
  if (!db) return false;

  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    return await txPromise(tx);
  } catch {
    return false;
  } finally {
    db.close();
  }
}

export async function removeDraftIndexedDb(key) {
  if (!key) return false;
  const db = await openDb();
  if (!db) return false;

  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    return await txPromise(tx);
  } catch {
    return false;
  } finally {
    db.close();
  }
}
