import React, { useEffect, useRef, useState } from "react";

// ErrorBoundary catches unexpected runtime errors and shows a fallback UI.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, detail: "" };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, detail: err?.message || String(err) || "Unknown error" };
  }
  componentDidCatch(error, info) {
    console.error("Caught error in ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-6">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <h1 className="text-xl font-bold mb-2">App Error</h1>
            <p className="text-sm mb-3">An unexpected error occurred. This preview environment might not support certain browser APIs like IndexedDB.</p>
            <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto border border-gray-700">{this.state.detail}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TodoApp() {
  return (
    <ErrorBoundary>
      <TodoInner />
    </ErrorBoundary>
  );
}

function TodoInner() {
  const [storage, setStorage] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const editInputRef = useRef(null);

  // Initialize storage safely.
  useEffect(() => {
    (async () => {
      try {
        const s = await createSafeStorage();
        setStorage(s);
        setTodos(await s.getAll());
      } catch (e) {
        console.error("Storage init failed", e);
        setErrorMsg("Storage initialization failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto focus when entering edit mode
  useEffect(() => {
    if (editId != null) {
      setTimeout(() => editInputRef.current?.focus(), 0);
    }
  }, [editId]);

  async function addTodo() {
    if (!storage) return;
    const text = newTodo.trim();
    if (!text) return;
    try {
      const item = await storage.add({ text, completed: false, createdAt: Date.now() });
      setTodos(prev => [...prev, item]);
      setNewTodo("");
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to add todo.");
    }
  }

  async function toggleTodo(id) {
    if (!storage) return;
    const current = todos.find(t => t.id === id);
    if (!current) return;
    try {
      const updated = await storage.update(id, { completed: !current.completed });
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to toggle todo.");
    }
  }

  async function deleteTodo(id) {
    if (!storage) return;
    try {
      await storage.delete(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      if (editId === id) {
        setEditId(null);
        setEditText("");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to delete todo.");
    }
  }

  function beginEdit(id) {
    const t = todos.find(x => x.id === id);
    if (!t || t.completed) return;
    setEditId(id);
    setEditText(t.text);
  }

  async function commitEdit() {
    if (editId == null || !storage) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      await deleteTodo(editId);
      return;
    }
    try {
      const updated = await storage.update(editId, { text: trimmed });
      setTodos(prev => prev.map(t => (t.id === editId ? updated : t)));
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to save edit.");
    } finally {
      setEditId(null);
      setEditText("");
    }
  }

  async function clearAll() {
    if (!storage) return;
    try {
      await storage.clearAll();
      setTodos([]);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to clear list.");
    }
  }

  async function shareList() {
    const incomplete = todos.filter(t => !t.completed);
    const completed = todos.filter(t => t.completed);
    const header = `Todo List (${incomplete.length} open, ${completed.length} done)`;
    const bodyOpen = incomplete.map(t => `• ${t.text}`).join("\n") || "(no open items)";
    const bodyDone = completed.length ? "\n\nCompleted:\n" + completed.map(t => `✓ ${t.text}`).join("\n") : "";
    const text = header + "\n\n" + bodyOpen + bodyDone;
    const shareData = {
      title: "My Todo List",
      text,
    };
    if (typeof window !== "undefined" && window.location) {
      shareData.url = window.location.href;
    }
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData);
        setInfoMsg("Shared.");
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setInfoMsg("Copied to clipboard.");
      } else {
        setInfoMsg("Sharing not supported.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Share failed.");
    }
  }

  // Sort incomplete first
  const sortedTodos = [...todos].sort((a, b) => (a.completed === b.completed ? (a.createdAt - b.createdAt) : a.completed ? 1 : -1));

  useEffect(() => {
    if (errorMsg || infoMsg) {
      const t = setTimeout(() => { setErrorMsg(""); setInfoMsg(""); }, 2500);
      return () => clearTimeout(t);
    }
  }, [errorMsg, infoMsg]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-xl flex justify-end gap-2 mb-2">
        <button onClick={shareList} className="px-3 py-1 rounded bg-gray-800 border border-gray-700">Share</button>
        <button onClick={clearAll} className="px-3 py-1 rounded bg-gray-800 border border-gray-700">Clear</button>
      </div>
      <div className="w-full max-w-xl flex gap-2 mb-4">
        <input className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700" value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} />
        <button onClick={addTodo} className="px-4 rounded-xl bg-blue-600 hover:bg-blue-500">Add</button>
      </div>
      <ul className="w-full max-w-xl space-y-2">
        {sortedTodos.map(todo => (
          <li key={todo.id} className={`flex items-center gap-2 p-3 rounded-xl border \${todo.completed ? "bg-gray-800/40 opacity-60" : "bg-gray-800"}`}>
            <button onClick={() => toggleTodo(todo.id)} className="h-5 w-5 border border-gray-500 flex items-center justify-center">{todo.completed ? "✓" : ""}</button>
            {editId === todo.id ? (
              <input ref={editInputRef} className="flex-1 bg-gray-900 border border-gray-700" value={editText} onChange={e => setEditText(e.target.value)} onBlur={commitEdit} onKeyDown={e => e.key === "Enter" ? commitEdit() : e.key === "Escape" && setEditId(null)} />
            ) : (
              <span className={`flex-1 \${todo.completed ? "line-through text-gray-500" : "cursor-text"}`} onDoubleClick={() => beginEdit(todo.id)}>{todo.text}</span>
            )}
            <button onClick={() => !todo.completed && beginEdit(todo.id)} disabled={todo.completed} className="px-2">Edit</button>
            <button onClick={() => !todo.completed && deleteTodo(todo.id)} disabled={todo.completed} className="px-2 text-red-300">✖</button>
          </li>
        ))}
        {sortedTodos.length === 0 && <li className="text-center text-gray-400">No todos yet.</li>}
      </ul>
      {errorMsg && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900 px-4 py-2 rounded border border-red-700">{errorMsg}</div>}
      {infoMsg && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded border border-gray-700">{infoMsg}</div>}
    </div>
  );
}

// Safe storage creator with fallbacks.
async function createSafeStorage() {
  const hasIndexedDB = typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
  if (hasIndexedDB) {
    try {
      const db = await openDB("todoDB", 1, db => {
        if (!db.objectStoreNames.contains("todos")) db.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
      });
      return idbStorage(db);
    } catch (e) {
      console.warn("IndexedDB unavailable", e);
    }
  }
  try {
    return localStorageStorage("todos_local");
  } catch {
    return memoryStorage();
  }
}

function openDB(name, version, upgrade) {
  return new Promise((resolve, reject) => {
    try {
      const req = window.indexedDB.open(name, version);
      req.onupgradeneeded = e => upgrade(e.target.result);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

function idbStorage(db) {
  const store = "todos";
  const tx = (mode, fn) => new Promise((res, rej) => {
    const tx = db.transaction(store, mode);
    const s = tx.objectStore(store);
    fn(s, res, rej);
    tx.onerror = () => rej(tx.error);
  });
  return {
    backend: "IndexedDB",
    getAll: () => tx("readonly", (s, res) => { const r = s.getAll(); r.onsuccess = () => res(r.result || []); }),
    add: todo => tx("readwrite", (s, res) => { const r = s.add(todo); r.onsuccess = () => res({ ...todo, id: r.result }); }),
    update: (id, patch) => tx("readwrite", (s, res) => { const g = s.get(id); g.onsuccess = () => { if (!g.result) return res(null); const upd = { ...g.result, ...patch }; const p = s.put(upd); p.onsuccess = () => res(upd); }; }),
    delete: id => tx("readwrite", (s, res) => { const d = s.delete(id); d.onsuccess = () => res(); }),
    clearAll: () => tx("readwrite", (s, res) => { const c = s.clear(); c.onsuccess = () => res(); })
  };
}

function localStorageStorage(key) {
  const read = () => JSON.parse(window.localStorage.getItem(key) || "[]");
  const write = data => window.localStorage.setItem(key, JSON.stringify(data));
  const uid = () => Date.now() + Math.floor(Math.random() * 1000);
  return {
    backend: "localStorage",
    getAll: async () => read(),
    add: async todo => { const list = read(); const item = { ...todo, id: uid() }; write([...list, item]); return item; },
    update: async (id, patch) => { const list = read(); const idx = list.findIndex(t => t.id === id); if (idx < 0) return null; list[idx] = { ...list[idx], ...patch }; write(list); return list[idx]; },
    delete: async id => write(read().filter(t => t.id !== id)),
    clearAll: async () => write([])
  };
}

function memoryStorage() {
  let mem = [];
  const uid = () => Date.now() + Math.floor(Math.random() * 1000);
  return {
    backend: "memory",
    getAll: async () => [...mem],
    add: async todo => { const item = { ...todo, id: uid() }; mem.push(item); return item; },
    update: async (id, patch) => { const idx = mem.findIndex(t => t.id === id); if (idx < 0) return null; mem[idx] = { ...mem[idx], ...patch }; return mem[idx]; },
    delete: async id => { mem = mem.filter(t => t.id !== id); },
    clearAll: async () => { mem = []; }
  };
}
