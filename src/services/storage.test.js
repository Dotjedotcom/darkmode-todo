import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSafeStorage } from './storage.js';

function createLocalStorageStub() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    _dump() {
      return store;
    },
  };
}

describe('createSafeStorage', { concurrency: false }, () => {
  afterEach(() => {
    delete globalThis.window;
  });

  it('provides an in-memory store when window is unavailable', async () => {
    delete globalThis.window;
    const storage = await createSafeStorage();
    assert.equal(storage.backend, 'memory');

    const first = await storage.add({ text: 'memory task', completed: false, createdAt: 1 });
    assert.ok(first.id, 'memory store should assign ids');

    const fetched = await storage.getAll();
    assert.equal(fetched.length, 1);
    assert.equal(fetched[0].text, 'memory task');

    await storage.update(first.id, { completed: true });
    const afterUpdate = await storage.getAll();
    assert.equal(afterUpdate[0].completed, true);

    await storage.delete(first.id);
    const afterDelete = await storage.getAll();
    assert.deepEqual(afterDelete, []);
  });

  it('falls back to localStorage when available', async () => {
    const localStorage = createLocalStorageStub();
    globalThis.window = {
      localStorage,
      indexedDB: undefined,
    };

    const storage = await createSafeStorage();
    assert.equal(storage.backend, 'localStorage');

    const created = await storage.add({ text: 'ls task', completed: false, createdAt: 2 });
    const raw = JSON.parse(localStorage.getItem('todos_local'));
    assert.equal(raw.length, 1);

    await storage.update(created.id, { text: 'updated task' });
    const updatedRaw = JSON.parse(localStorage.getItem('todos_local'));
    assert.equal(updatedRaw[0].text, 'updated task');

    await storage.clearAll();
    const cleared = JSON.parse(localStorage.getItem('todos_local'));
    assert.equal(cleared.length, 0);
  });
});
