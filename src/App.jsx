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
  const [newCategory, setNewCategory] = useState("");
  const [newDue, setNewDue] = useState(""); // datetime-local string
  const [newPriority, setNewPriority] = useState("normal"); // low | normal | high
  const [editCategory, setEditCategory] = useState("");
  const [editDue, setEditDue] = useState(""); // datetime-local string
  const [editPriority, setEditPriority] = useState("normal");
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | completed
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("default"); // default | due | created | priority
  const [confirmKind, setConfirmKind] = useState(null); // 'clearAll' | 'clearCompleted' | 'importReplace' | 'deleteOne' | 'toggleAll'
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showUtilities, setShowUtilities] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [replaceOnImport, setReplaceOnImport] = useState(false);
  const [pendingImport, setPendingImport] = useState(null); // array of sanitized items awaiting confirmation
  const [pendingDelete, setPendingDelete] = useState(null); // todo being considered for deletion
  const [openDueId, setOpenDueId] = useState(null); // which item's due tooltip is open
  const fileInputRef = useRef(null);
  const editInputRef = useRef(null);
  const shareMenuRef = useRef(null);

  // Simple inline icons for a tidy UI
  function Icon({ name, className = "h-4 w-4" }) {
    const common = {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      'aria-hidden': true,
      focusable: false,
    };
    switch (name) {
      case 'share':
        return <svg {...common}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v14" /></svg>;
      case 'download':
        return <svg {...common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>;
      case 'upload':
        return <svg {...common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5-5 5 5" /><path d="M12 5v12" /></svg>;
      case 'csv':
        return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>;
      case 'plus':
        return <svg {...common}><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
      case 'toggle':
        return <svg {...common}><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="9" cy="12" r="3" /></svg>;
      case 'broom':
        return <svg {...common}><path d="M3 21l6-6" /><path d="M15 3l6 6" /><path d="M9 15l6-6" /><path d="M7 17l-2 4 4-2" /></svg>;
      case 'trash':
        return <svg {...common}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>;
      case 'sliders':
        return (
          <svg {...common}>
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        );
      case 'list':
        return <svg {...common}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>;
      case 'circle':
        return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
      case 'check-circle':
        return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>;
      case 'check':
        return <svg {...common}><path d="M20 6L9 17l-5-5" /></svg>;
      case 'x':
        return <svg {...common}><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>;
      case 'chevron-down':
        return <svg {...common}><path d="M6 9l6 6 6-6" /></svg>;
      case 'chevron-up':
        return <svg {...common}><path d="M18 15l-6-6-6 6" /></svg>;
      case 'calendar':
        return (
          <svg {...common}>
            <rect x="3" y="5" width="18" height="16" rx="2"/>
            <path d="M16 3v4M8 3v4M3 11h18" />
          </svg>
        );
      default:
        return null;
    }
  }

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

  function parseDateLocal(value) {
    if (!value || typeof value !== 'string') return null;
    const [yStr, mStr, dStr] = value.split('-');
    const y = parseInt(yStr, 10), m = parseInt(mStr, 10), d = parseInt(dStr, 10);
    if ([y, m, d].some(n => Number.isNaN(n))) return null;
    const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
    return dt.getTime();
  }

  function toLocalDateInput(ms) {
    if (ms == null) return '';
    const d = new Date(ms);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    return `${yyyy}-${MM}-${DD}`;
  }

  function defaultDateLocal() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return toLocalDateInput(d.getTime());
  }

  // initialize default due value once on mount
  useEffect(() => {
    setNewDue(defaultDateLocal());
  }, []);

  async function addTodo() {
    if (!storage) return;
    const text = newTodo.trim();
    if (!text) return;
    try {
      const category = newCategory.trim() || "";
      const dueAt = parseDateLocal(newDue);
      const item = await storage.add({ text, category, dueAt, priority: newPriority, completed: false, createdAt: Date.now() });
      setTodos(prev => [...prev, item]);
      setNewTodo("");
      setNewCategory("");
      setNewDue(defaultDateLocal());
      setNewPriority("normal");
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
    setEditCategory(t.category || "");
    setEditDue(t.dueAt ? toLocalDateInput(t.dueAt) : "");
    setEditPriority(t.priority || "normal");
  }

  async function commitEdit() {
    if (editId == null || !storage) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      await deleteTodo(editId);
      return;
    }
    try {
      const category = editCategory.trim() || "";
      const dueAt = parseDateLocal(editDue);
      const updated = await storage.update(editId, { text: trimmed, category, dueAt, priority: editPriority || "normal" });
      setTodos(prev => prev.map(t => (t.id === editId ? updated : t)));
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to save edit.");
    } finally {
      setEditId(null);
      setEditText("");
      setEditCategory("");
      setEditDue("");
      setEditPriority("normal");
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

  async function clearCompleted() {
    if (!storage) return;
    const toDelete = todos.filter(t => t.completed).map(t => t.id);
    try {
      await Promise.all(toDelete.map(id => storage.delete(id)));
      setTodos(prev => prev.filter(t => !t.completed));
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to clear completed.");
    }
  }

  async function toggleAll() {
    if (!storage) return;
    const anyActive = todos.some(t => !t.completed);
    try {
      const updates = await Promise.all(
        todos.map(t => storage.update(t.id, { completed: anyActive ? true : false }))
      );
      const byId = new Map(updates.map(u => [u.id, u]));
      setTodos(prev => prev.map(t => byId.get(t.id) || t));
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to toggle all.");
    }
  }

  function requestDelete(todo) {
    if (todo?.completed) return;
    setPendingDelete(todo);
    setConfirmKind('deleteOne');
  }

  function exportTodos() {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        count: todos.length,
        items: todos.map(t => ({
          // include id for reference, importer will ignore
          id: t.id,
          text: t.text,
          category: t.category || "",
          dueAt: typeof t.dueAt === 'number' ? t.dueAt : null,
          priority: t.priority || 'normal',
          completed: !!t.completed,
          createdAt: t.createdAt || Date.now(),
        })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `todos-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setInfoMsg('Exported list.');
    } catch (e) {
      console.error(e);
      setErrorMsg('Export failed.');
    }
  }

  function exportTodosCSV() {
    try {
      const headers = ['text','category','dueAt','priority','completed','createdAt'];
      const escape = v => {
        if (v == null) return '';
        const s = String(v);
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const rows = [headers.join(',')].concat(
        todos.map(t => [
          escape(t.text),
          escape(t.category || ''),
          escape(t.dueAt ?? ''),
          escape(t.priority || 'normal'),
          escape(t.completed ? 1 : 0),
          escape(t.createdAt || ''),
        ].join(','))
      );
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `todos-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setInfoMsg('Exported CSV.');
    } catch (e) {
      console.error(e);
      setErrorMsg('CSV export failed.');
    }
  }

  function triggerImport() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e) {
    const file = e.target?.files?.[0];
    if (!file) return;
    if (!storage) { setErrorMsg('Storage not ready.'); e.target.value = ''; return; }
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      let items = Array.isArray(json) ? json : (Array.isArray(json.items) ? json.items : (Array.isArray(json.todos) ? json.todos : []));
      if (!Array.isArray(items) || items.length === 0) {
        setErrorMsg('No items found in file.');
        return;
      }
      const sanitized = items.map(r => {
        const text = (r && typeof r.text === 'string') ? r.text : '';
        const category = (r && typeof r.category === 'string') ? r.category : '';
        const dueAt = (r && (typeof r.dueAt === 'number' || typeof r.dueAt === 'string')) ? (isNaN(Number(r.dueAt)) ? null : Number(r.dueAt)) : null;
        const priority = (r && (r.priority === 'low' || r.priority === 'normal' || r.priority === 'high')) ? r.priority : 'normal';
        const completed = !!(r && r.completed);
        const createdAt = (r && typeof r.createdAt === 'number') ? r.createdAt : Date.now();
        return { text, category, dueAt, priority, completed, createdAt };
      }).filter(x => x.text.trim().length > 0);
      if (sanitized.length === 0) { setErrorMsg('Nothing to import.'); return; }
      if (replaceOnImport) {
        setPendingImport(sanitized);
        setConfirmKind('importReplace');
      } else {
        const added = await Promise.all(sanitized.map(it => storage.add(it)));
        setTodos(prev => [...prev, ...added]);
        setInfoMsg(`Imported ${added.length} item(s).`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Import failed.');
    } finally {
      // reset file input
      if (e.target) e.target.value = '';
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

  // Derived lists: filter, search, sort
  const matching = todos.filter(t => {
    if (filterStatus === 'active' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterCategory && (t.category || '').trim() !== filterCategory.trim()) return false;
    if (search && !(`${t.text} ${t.category || ''}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });
  const sortedTodos = [...matching].sort((a, b) => {
    if (sortMode === 'due') {
      const ad = a.dueAt ?? Number.POSITIVE_INFINITY; const bd = b.dueAt ?? Number.POSITIVE_INFINITY;
      if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0)) return a.completed ? 1 : -1;
      return ad - bd;
    }
    if (sortMode === 'created') {
      if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0)) return a.completed ? 1 : -1;
      return a.createdAt - b.createdAt;
    }
    if (sortMode === 'priority') {
      const order = { high: 0, normal: 1, low: 2 };
      if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0)) return a.completed ? 1 : -1;
      return (order[a.priority || 'normal'] - order[b.priority || 'normal']) || (a.createdAt - b.createdAt);
    }
    // default
    return (a.completed === b.completed ? (a.createdAt - b.createdAt) : a.completed ? 1 : -1);
  });

  const remainingCount = todos.filter(t => !t.completed).length;

  useEffect(() => {
    if (errorMsg || infoMsg) {
      const t = setTimeout(() => { setErrorMsg(""); setInfoMsg(""); }, 2500);
      return () => clearTimeout(t);
    }
  }, [errorMsg, infoMsg]);

  // Close Share menu on outside click and Escape
  useEffect(() => {
    if (!showShareMenu) return;
    const onDocClick = (e) => {
      if (!shareMenuRef.current) return;
      if (!shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setShowShareMenu(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showShareMenu]);

  // Build category suggestions
  const categoryOptions = Array.from(new Set(todos.map(t => (t.category || "").trim()).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-6">
      <h1 className="w-full max-w-3xl text-3xl font-extrabold tracking-tight mb-2">
        <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">Todos</span>
      </h1>
      {/* Menu bar with Share dropdown */}
      <div id="menu" className="w-full max-w-3xl flex items-center justify-between mb-3 to-gray-100">
        <div className="text-sm text-gray-400">{remainingCount} remaining</div>
        <div className="relative" ref={shareMenuRef}>
          <button onClick={() => setShowShareMenu(v => !v)} className="px-3 py-1 rounded bg-gray-800 border border-gray-700 flex items-center gap-2" title="Share / Import / Export">
            <Icon name="share" />
            Share
          </button>
          {showShareMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-700 bg-gray-900 shadow-lg z-10">
              <div className="py-1 text-sm">
                <button onClick={() => { setShowShareMenu(false); shareList(); }} className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"><Icon name="share" /> Share</button>
                <button onClick={() => { setShowShareMenu(false); exportTodos(); }} className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"><Icon name="download" /> Export JSON</button>
                <button onClick={() => { setShowShareMenu(false); exportTodosCSV(); }} className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"><Icon name="csv" /> Export CSV</button>
                <button onClick={() => { setShowShareMenu(false); triggerImport(); }} className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"><Icon name="upload" /> Import JSON</button>
                <label className="flex items-center gap-2 px-3 py-2 border-t border-gray-800 text-xs text-gray-300 select-none">
                  <input type="checkbox" className="accent-gray-500" checked={replaceOnImport} onChange={e => setReplaceOnImport(e.target.checked)} />
                  replace on import
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      <div id="add" className="w-full max-w-3xl flex flex-wrap gap-2 mb-3">
        <input
          className="flex-1 min-w-[200px] p-3 rounded-xl bg-gray-800 border border-gray-700"
          placeholder="What needs doing?"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTodo()}
        />
        <button onClick={addTodo} className="px-4 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center gap-2" title="Add">
          <Icon name="plus" />
        </button>
        <button onClick={() => setShowAdvanced(v => !v)} aria-expanded={showAdvanced} className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 flex items-center gap-2" title={showAdvanced ? 'Hide options' : 'More options'}>
          {showAdvanced ? <Icon name="chevron-up" /> : <Icon name="chevron-down" />}
          <span className="sr-only">{showAdvanced ? 'Hide options' : 'More options'}</span>
        </button>
        <button
          onClick={() => setShowUtilities(v => !v)}
          aria-pressed={showUtilities}
          className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${showUtilities ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-800'}`}
          title={showUtilities ? 'Hide utilities' : 'Show utilities'}
        >
          <Icon name="sliders" />
          <span className="sr-only">Toggle utilities</span>
        </button>
      </div>
      {showAdvanced && (
        <div id="options" className="w-full max-w-3xl flex flex-wrap gap-2 mb-4">
          <input
            className="p-3 rounded-xl bg-gray-800 border border-gray-700 w-44 flex-1 min-w-[160px]"
            placeholder="Category"
            list="category-options"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
          />
          <input
            type="date"
            className="p-3 rounded-xl bg-gray-800 border border-gray-700 min-w-[200px]"
            value={newDue}
            onChange={e => setNewDue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
          />
          <select
            className="p-3 rounded-xl bg-gray-800 border border-gray-700 w-36"
            value={newPriority}
            onChange={e => setNewPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
          <datalist id="category-options">
            {categoryOptions.map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      )}
      {showUtilities && (
      <div id="utility" className="w-full max-w-3xl flex flex-col md:flex-row md:items-center md:gap-4 mb-3">
        <div className="flex sm:flex-row items-start gap-4 justify">
          <div className="flex flex-col md:flex-row md:flex-wrap gap-2">
            <div className="flex items-center gap-2 md:contents">
              <button
                onClick={() => setFilterStatus('all')}
                aria-pressed={filterStatus === 'all'}
                className={`p-2 rounded border flex items-center justify-center ${filterStatus === 'all' ? 'bg-gray-700 border-gray-500' : 'bg-gray-800 border-gray-700'} hover:border-gray-500`}
                title="Show all"
              >
                <Icon name="list" />
                <span className="sr-only">All</span>
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                aria-pressed={filterStatus === 'active'}
                className={`p-2 rounded border flex items-center justify-center ${filterStatus === 'active' ? 'bg-gray-700 border-gray-500' : 'bg-gray-800 border-gray-700'} hover:border-gray-500`}
                title="Active"
              >
                <Icon name="circle" />
                <span className="sr-only">Active</span>
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                aria-pressed={filterStatus === 'completed'}
                className={`p-2 rounded border flex items-center justify-center ${filterStatus === 'completed' ? 'bg-gray-700 border-gray-500' : 'bg-gray-800 border-gray-700'} hover:border-gray-500`}
                title="Completed"
              >
                <Icon name="check-circle" />
                <span className="sr-only">Completed</span>
              </button>
            </div>
            <div className="flex items-center gap-2 md:contents">
              <span className="relative group">
                <button onClick={() => setConfirmKind('toggleAll')} className="p-2 rounded bg-gray-800 border border-red-700 text-red-300 hover:border-red-500" aria-label="Toggle all">
                  <Icon name="toggle" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-gray-100 border border-gray-700 rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap">Toggle all</div>
              </span>
              <span className="relative group">
                <button onClick={() => setConfirmKind('clearCompleted')} disabled={todos.filter(t => t.completed).length === 0} className={`p-2 rounded border ${todos.filter(t => t.completed).length === 0 ? 'bg-gray-800 border-red-900 opacity-50 cursor-not-allowed text-red-400' : 'bg-gray-800 border-red-700 hover:border-red-500 text-red-300'}`} aria-label="Clear completed">
                  <Icon name="broom" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-gray-100 border border-gray-700 rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap">Clear completed</div>
              </span>
              <span className="relative group">
                <button onClick={() => setConfirmKind('clearAll')} disabled={todos.length === 0} className={`p-2 rounded border ${todos.length === 0 ? 'bg-gray-800 border-red-900 opacity-50 cursor-not-allowed text-red-400' : 'bg-gray-800 border-red-700 hover:border-red-500 text-red-300'}`} aria-label="Clear all">
                  <Icon name="trash" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-gray-100 border border-gray-700 rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap">Clear all</div>
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="px-2 py-1 rounded bg-gray-800 border border-gray-700" />
            </div>
            <div className="flex items-center gap-2">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-2 py-1 rounded bg-gray-800 border border-gray-700">
                <option value="">categories</option>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="px-2 py-1 rounded bg-gray-800 border border-gray-700">
                <option value="default">Sort: Default</option>
                <option value="due">Sort: Due date</option>
                <option value="created">Sort: Created</option>
                <option value="priority">Sort: Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      )}
      
      <ul id="list" className="w-full max-w-3xl space-y-2">
        {sortedTodos.map(todo => {
          const overdue = !!todo.dueAt && !todo.completed && todo.dueAt < Date.now();
          return (
            <li key={todo.id} className={`group flex flex-col gap-2 p-3 rounded-xl border ${todo.completed ? "bg-gray-800/40 opacity-60" : "bg-gray-800"} hover:border-gray-500 transition-colors shadow-sm`}>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleTodo(todo.id)} className="h-5 w-5 border border-gray-500 flex items-center justify-center">{todo.completed ? "✓" : ""}</button>
                {editId === todo.id ? (
                  <>
                    <input
                      ref={editInputRef}
                      className="flex-1 bg-gray-900 border border-gray-700 p-1 rounded"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => e.key === "Escape" && setEditId(null)}
                    />
                    <input
                      className="bg-gray-900 border border-gray-700 p-1 rounded w-36"
                      placeholder="Category"
                      list="category-options"
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                    />
                    <input
                      type="date"
                      className="bg-gray-900 border border-gray-700 p-1 rounded min-w-[120px] text-sm"
                      value={editDue}
                      onChange={e => setEditDue(e.target.value)}
                    />
                    <select
                      className="bg-gray-900 border border-gray-700 p-1 rounded w-32"
                      value={editPriority}
                      onChange={e => setEditPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                    <button onClick={commitEdit} className="p-1 rounded bg-green-600 hover:bg-green-500 text-white" title="Save">
                      <Icon name="check" />
                      <span className="sr-only">Save</span>
                    </button>
                    <button onClick={() => { setEditId(null); setEditText(""); setEditCategory(""); setEditDue(""); setEditPriority("normal"); }} className="p-1 rounded bg-red-600 hover:bg-red-500 text-white" title="Cancel">
                      <Icon name="x" />
                      <span className="sr-only">Cancel</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`flex-1 ${todo.completed ? "line-through text-gray-500" : "cursor-text"}`} onDoubleClick={() => beginEdit(todo.id)}>{todo.text}</span>
                    {todo.category && <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 border border-gray-600">{todo.category}</span>}
                    {todo.dueAt && (
                      <span
                        className="relative inline-block group"
                        onMouseEnter={() => setOpenDueId(todo.id)}
                        onMouseLeave={() => setOpenDueId(prev => (prev === todo.id ? null : prev))}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenDueId(prev => (prev === todo.id ? null : todo.id))}
                          className={`h-6 w-6 rounded border border-transparent flex items-center justify-center ${overdue ? 'text-red-300' : 'text-gray-300'} hover:border-gray-600`}
                          title="Due date"
                        >
                          <Icon name="calendar" className="h-4 w-4" />
                        </button>
                        {openDueId === todo.id && (
                          <div className="absolute z-20 bottom-full right-0 mb-2 bg-gray-900 text-gray-100 border border-gray-700 rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap">
                            {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(todo.dueAt))}
                          </div>
                        )}
                      </span>
                    )}
                    {(
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${
                        (todo.priority || 'normal') === 'high' ? 'bg-red-900/40 border-red-700 text-red-300' :
                        (todo.priority || 'normal') === 'low' ? 'bg-green-900/40 border-green-700 text-green-300' : 'bg-gray-700 border-gray-600'
                      }`}>
                        {todo.priority || 'normal'}
                      </span>
                    )}
                  </>
                )}
                {editId !== todo.id && (
                  <>
                    <button onClick={() => !todo.completed && beginEdit(todo.id)} disabled={todo.completed} className="px-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" title="Edit">
                      <Icon name="edit" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button onClick={() => !todo.completed && requestDelete(todo)} disabled={todo.completed} className="px-2 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" title="Delete">
                      <Icon name="trash" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
        {sortedTodos.length === 0 && <li className="text-center text-gray-400">No todos yet.</li>}
      </ul>
      {errorMsg && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900 px-4 py-2 rounded border border-red-700">{errorMsg}</div>}
      {infoMsg && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded border border-gray-700">{infoMsg}</div>}

      {confirmKind && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Confirm</h2>
            <p className="text-sm text-gray-300 mb-4">
              {confirmKind === 'clearAll'
                ? 'Clear all todos? This cannot be undone.'
                : confirmKind === 'clearCompleted'
                ? `Clear ${todos.filter(t => t.completed).length} completed item(s)?`
                : confirmKind === 'importReplace' && pendingImport
                ? `Replace current list with ${pendingImport.length} imported item(s)? This cannot be undone.`
                : confirmKind === 'deleteOne' && pendingDelete
                ? `Delete "${pendingDelete.text}"? This cannot be undone.`
                : confirmKind === 'toggleAll'
                ? 'Toggle all todos?'
                : 'Are you sure?'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmKind(null)} className="px-3 py-1 rounded bg-gray-700 border border-gray-600">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    if (confirmKind === 'clearAll') {
                      await clearAll();
                    } else if (confirmKind === 'clearCompleted') {
                      await clearCompleted();
                    } else if (confirmKind === 'importReplace' && Array.isArray(pendingImport) && pendingImport.length) {
                      await clearAll();
                      const added = await Promise.all(pendingImport.map(it => storage.add(it)));
                      setTodos(added);
                      setInfoMsg(`Replaced with ${added.length} item(s).`);
                    } else if (confirmKind === 'deleteOne' && pendingDelete) {
                      await deleteTodo(pendingDelete.id);
                    } else if (confirmKind === 'toggleAll') {
                      await toggleAll();
                    }
                  } finally {
                    setConfirmKind(null);
                    setPendingImport(null);
                    setPendingDelete(null);
                  }
                }}
                className="px-3 py-1 rounded bg-red-600 border border-red-700"
              >
                Yes, clear
              </button>
            </div>
          </div>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
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
