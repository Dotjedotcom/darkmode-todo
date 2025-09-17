/**
 * @typedef {Object} TodoItem
 * @property {number} id
 * @property {string} text
 * @property {string} [category]
 * @property {number|null} [dueAt]
 * @property {('low'|'normal'|'high')} [priority]
 * @property {boolean} completed
 * @property {number} createdAt
 */

/**
 * @typedef {Object} TodoStoreState
 * @property {import('../../../services/storage.js').SafeStorage|null} storage
 * @property {TodoItem[]} todos
 * @property {boolean} storageReady
 * @property {Promise<import('../../../services/storage.js').SafeStorage>|null} initPromise
 * @property {() => Promise<import('../../../services/storage.js').SafeStorage>} storageFactory
 */

import { create } from 'zustand';
import { createSafeStorage } from '../../../services/storage.js';
import { parseDateLocal } from '../../../utils/date.js';

export const useTodoStore = create((set, get) => ({
  storage: null,
  todos: [],
  storageReady: false,
  initPromise: null,
  storageFactory: createSafeStorage,
  async init() {
    const { storageReady, storage, initPromise, storageFactory } = get();
    if (storageReady && storage) return storage;
    if (initPromise) return initPromise;
    const promise = (async () => {
      const resolvedStorage = await storageFactory();
      const existing = await resolvedStorage.getAll();
      set({ storage: resolvedStorage, todos: existing, storageReady: true });
      return resolvedStorage;
    })();
    set({ initPromise: promise });
    try {
      return await promise;
    } finally {
      set((state) => (state.initPromise === promise ? { initPromise: null } : {}));
    }
  },
  async addTodo({ text, category, dueInput, priority }) {
    const { storage } = get();
    if (!storage) throw new Error('Storage not ready');
    const dueAt = parseDateLocal(dueInput);
    const item = await storage.add({
      text,
      category: (category || '').trim(),
      dueAt,
      priority: priority || 'normal',
      completed: false,
      createdAt: Date.now(),
    });
    set((state) => ({ todos: [...state.todos, item] }));
    return item;
  },
  async toggleTodo(id) {
    const { storage, todos } = get();
    if (!storage) throw new Error('Storage not ready');
    const current = todos.find((todo) => todo.id === id);
    if (!current) return null;
    const updated = await storage.update(id, { completed: !current.completed });
    set((state) => ({
      todos: state.todos.map((todo) => (todo.id === id ? updated : todo)),
    }));
    return updated;
  },
  async deleteTodo(id) {
    const { storage } = get();
    if (!storage) throw new Error('Storage not ready');
    await storage.delete(id);
    set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) }));
  },
  async updateTodo(id, { text, category, dueInput, priority }) {
    const { storage } = get();
    if (!storage) throw new Error('Storage not ready');
    const dueAt = parseDateLocal(dueInput);
    const updated = await storage.update(id, {
      text,
      category: (category || '').trim(),
      dueAt,
      priority: priority || 'normal',
    });
    if (!updated) return null;
    set((state) => ({
      todos: state.todos.map((todo) => (todo.id === id ? updated : todo)),
    }));
    return updated;
  },
  async clearAll() {
    const { storage } = get();
    if (!storage) throw new Error('Storage not ready');
    await storage.clearAll();
    set({ todos: [] });
  },
  async clearCompleted() {
    const { storage, todos } = get();
    if (!storage) throw new Error('Storage not ready');
    const completedIds = todos.filter((todo) => todo.completed).map((todo) => todo.id);
    await Promise.all(completedIds.map((id) => storage.delete(id)));
    set({ todos: todos.filter((todo) => !todo.completed) });
  },
  async toggleAll() {
    const { storage, todos } = get();
    if (!storage) throw new Error('Storage not ready');
    if (todos.length === 0) return [];
    const anyActive = todos.some((todo) => !todo.completed);
    const updates = await Promise.all(
      todos.map((todo) => storage.update(todo.id, { completed: anyActive ? true : false })),
    );
    const byId = new Map(updates.map((todo) => [todo.id, todo]));
    set({ todos: todos.map((todo) => byId.get(todo.id) || todo) });
    return updates;
  },
  async addMany(items) {
    const { storage } = get();
    if (!storage) throw new Error('Storage not ready');
    const added = await Promise.all(items.map((item) => storage.add(item)));
    set((state) => ({ todos: [...state.todos, ...added] }));
    return added;
  },
  async replaceAll(items) {
    const { storage } = get();
    if (!storage) throw new Error('Storage not ready');
    await storage.clearAll();
    const added = await Promise.all(items.map((item) => storage.add(item)));
    set({ todos: added });
    return added;
  },
}));

export const todoSelectors = {
  todos: (state) => state.todos,
  storageReady: (state) => state.storageReady,
  pendingCount: (state) => state.todos.filter((todo) => !todo.completed).length,
};

export const useTodos = () => useTodoStore(todoSelectors.todos);
export const usePendingCount = () => useTodoStore(todoSelectors.pendingCount);
export const useStorageReady = () => useTodoStore(todoSelectors.storageReady);

/**
 * Reset helper primarily for tests.
 */
export function resetTodoStore() {
  useTodoStore.setState({
    storage: null,
    todos: [],
    storageReady: false,
    initPromise: null,
    storageFactory: createSafeStorage,
  });
}
