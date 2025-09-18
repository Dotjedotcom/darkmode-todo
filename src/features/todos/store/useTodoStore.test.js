import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useTodoStore, resetTodoStore, todoSelectors } from './useTodoStore.js';

function createMockStorage(initialItems = []) {
  let nextId = initialItems.reduce((max, item) => Math.max(max, item.id ?? 0), 0) + 1;
  let list = initialItems.map((item) => ({ ...item }));

  return {
    backend: 'mock',
    async getAll() {
      return list.map((item) => ({ ...item }));
    },
    async add(todo) {
      const item = { ...todo, id: nextId++ };
      list = [...list, item];
      return { ...item };
    },
    async update(id, patch) {
      const index = list.findIndex((item) => item.id === id);
      if (index < 0) return null;
      list[index] = { ...list[index], ...patch };
      return { ...list[index] };
    },
    async delete(id) {
      list = list.filter((item) => item.id !== id);
    },
    async clearAll() {
      list = [];
    },
  };
}

function primeStoreWithStorage(storage, todos = []) {
  useTodoStore.setState({
    storage,
    todos,
    storageReady: true,
    initPromise: null,
    storageFactory: async () => storage,
  });
}

describe('useTodoStore', () => {
  afterEach(() => {
    resetTodoStore();
  });

  it('initialises storage only once even with concurrent calls', async () => {
    let calls = 0;
    const storage = createMockStorage();
    resetTodoStore();
    useTodoStore.setState({
      storageFactory: async () => {
        calls += 1;
        return storage;
      },
    });
    const initPromiseA = useTodoStore.getState().init();
    const initPromiseB = useTodoStore.getState().init();
    const [resultA, resultB] = await Promise.all([initPromiseA, initPromiseB]);
    assert.equal(calls, 1);
    assert.strictEqual(resultA, storage);
    assert.strictEqual(resultB, storage);
    assert.equal(useTodoStore.getState().storageReady, true);
    assert.deepEqual(await useTodoStore.getState().storage.getAll(), []);
  });

  it('adds, toggles, and deletes todos', async () => {
    const storage = createMockStorage();
    primeStoreWithStorage(storage, []);
    await useTodoStore.getState().addTodo({
      text: 'Write tests',
      category: 'dev',
      dueInput: '',
      priority: 'normal',
    });
    let todos = useTodoStore.getState().todos;
    assert.equal(todos.length, 1);
    assert.equal(todos[0].text, 'Write tests');
    assert.equal(todoSelectors.pendingCount(useTodoStore.getState()), 1);

    await useTodoStore.getState().toggleTodo(todos[0].id);
    todos = useTodoStore.getState().todos;
    assert.equal(todos[0].completed, true);

    await useTodoStore.getState().deleteTodo(todos[0].id);
    assert.equal(useTodoStore.getState().todos.length, 0);
  });

  it('updates existing todos and keeps state in sync', async () => {
    const storage = createMockStorage([
      {
        id: 1,
        text: 'Initial',
        category: '',
        dueAt: null,
        priority: 'normal',
        completed: false,
        createdAt: Date.now(),
      },
    ]);
    primeStoreWithStorage(storage, await storage.getAll());

    await useTodoStore.getState().updateTodo(1, {
      text: 'Updated',
      category: 'work',
      dueInput: '',
      priority: 'high',
    });

    const [todo] = useTodoStore.getState().todos;
    assert.equal(todo.text, 'Updated');
    assert.equal(todo.priority, 'high');
  });

  it('clears completed items and toggles all', async () => {
    const seed = [
      { id: 1, text: 'One', completed: false, createdAt: 1 },
      { id: 2, text: 'Two', completed: true, createdAt: 2 },
    ];
    const storage = createMockStorage(seed);
    primeStoreWithStorage(storage, await storage.getAll());

    await useTodoStore.getState().clearCompleted();
    assert.deepEqual(
      useTodoStore.getState().todos.map((t) => t.id),
      [1],
    );

    await useTodoStore.getState().toggleAll();
    assert.ok(useTodoStore.getState().todos.every((t) => t.completed));
  });

  it('supports bulk add and replace operations', async () => {
    const storage = createMockStorage();
    primeStoreWithStorage(storage, []);

    const bulk = [
      { text: 'A', completed: false, createdAt: 1 },
      { text: 'B', completed: false, createdAt: 2 },
    ];
    const added = await useTodoStore.getState().addMany(bulk);
    assert.equal(added.length, 2);
    assert.equal(useTodoStore.getState().todos.length, 2);

    const replacement = [{ text: 'C', completed: false, createdAt: 3 }];
    const replaced = await useTodoStore.getState().replaceAll(replacement);
    assert.equal(replaced.length, 1);
    assert.equal(useTodoStore.getState().todos.length, 1);
    assert.equal(useTodoStore.getState().todos[0].text, 'C');
  });
});
