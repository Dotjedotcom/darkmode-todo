/**
 * @typedef {Object} SafeStorage
 * @property {string} backend
 * @property {() => Promise<any[]>} getAll
 * @property {(item: any) => Promise<any>} add
 * @property {(id: number, patch: any) => Promise<any>} update
 * @property {(id: number) => Promise<void>} delete
 * @property {() => Promise<void>} clearAll
 */

export async function createSafeStorage() {
  const hasIndexedDB = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  if (hasIndexedDB) {
    try {
      const db = await openDB('todoDB', 1, (database) => {
        if (!database.objectStoreNames.contains('todos')) {
          database.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
        }
      });
      return idbStorage(db);
    } catch (e) {
      console.warn('IndexedDB unavailable', e);
    }
  }
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      return localStorageStorage('todos_local');
    } catch {
      // ignored, fall through to memory store
    }
  }
  return memoryStorage();
}

function openDB(name, version, upgrade) {
  return new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(name, version);
      request.onupgradeneeded = (event) => upgrade(event.target.result);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
}

function idbStorage(db) {
  const store = 'todos';
  const transaction = (mode, handler) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const objectStore = tx.objectStore(store);
      handler(objectStore, resolve, reject);
      tx.onerror = () => reject(tx.error);
    });

  return {
    backend: 'IndexedDB',
    getAll: () =>
      transaction('readonly', (store, resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
      }),
    add: (todo) =>
      transaction('readwrite', (store, resolve) => {
        const req = store.add(todo);
        req.onsuccess = () => resolve({ ...todo, id: req.result });
      }),
    update: (id, patch) =>
      transaction('readwrite', (store, resolve) => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          if (!getReq.result) return resolve(null);
          const updated = { ...getReq.result, ...patch };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
        };
      }),
    delete: (id) =>
      transaction('readwrite', (store, resolve) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
      }),
    clearAll: () =>
      transaction('readwrite', (store, resolve) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
      }),
  };
}

function localStorageStorage(key) {
  const read = () => JSON.parse(window.localStorage.getItem(key) || '[]');
  const write = (data) => window.localStorage.setItem(key, JSON.stringify(data));
  const uid = () => Date.now() + Math.floor(Math.random() * 1000);
  return {
    backend: 'localStorage',
    getAll: async () => read(),
    add: async (todo) => {
      const list = read();
      const item = { ...todo, id: uid() };
      write([...list, item]);
      return item;
    },
    update: async (id, patch) => {
      const list = read();
      const idx = list.findIndex((t) => t.id === id);
      if (idx < 0) return null;
      list[idx] = { ...list[idx], ...patch };
      write(list);
      return list[idx];
    },
    delete: async (id) => write(read().filter((t) => t.id !== id)),
    clearAll: async () => write([]),
  };
}

function memoryStorage() {
  let mem = [];
  const uid = () => Date.now() + Math.floor(Math.random() * 1000);
  return {
    backend: 'memory',
    getAll: async () => [...mem],
    add: async (todo) => {
      const item = { ...todo, id: uid() };
      mem.push(item);
      return item;
    },
    update: async (id, patch) => {
      const idx = mem.findIndex((t) => t.id === id);
      if (idx < 0) return null;
      mem[idx] = { ...mem[idx], ...patch };
      return mem[idx];
    },
    delete: async (id) => {
      mem = mem.filter((t) => t.id !== id);
    },
    clearAll: async () => {
      mem = [];
    },
  };
}
