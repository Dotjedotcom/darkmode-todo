import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/Icon.jsx';
import HeaderBar from './components/HeaderBar.jsx';
import AddTodoForm from './components/AddTodoForm.jsx';
import TodoUtilities from './components/TodoUtilities.jsx';
import TodoList from './components/TodoList.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import InfoDialog from './components/InfoDialog.jsx';
import {
  subscribeToServiceWorkerUpdate,
  applyServiceWorkerUpdate,
  subscribeToInstallPrompt,
  triggerInstallPrompt,
} from '@/services/serviceWorker.js';
import { useTodoStore, useTodos, usePendingCount, useStorageReady } from './store/useTodoStore.js';
import { DEFAULT_CATEGORIES } from '../../utils/category.js';
import { normalizePriority } from '../../utils/priority.js';

const ACTION_LABELS = {
  add: 'Adding todo…',
  toggle: 'Updating todo…',
  delete: 'Deleting todo…',
  update: 'Saving changes…',
  clearAll: 'Clearing all todos…',
  clearCompleted: 'Removing completed todos…',
  toggleAll: 'Toggling todos…',
  import: 'Importing todos…',
};

export default function TodoApp() {
  const todos = useTodos();
  const init = useTodoStore((state) => state.init);
  const addTodoToStore = useTodoStore((state) => state.addTodo);
  const toggleTodoInStore = useTodoStore((state) => state.toggleTodo);
  const deleteTodoFromStore = useTodoStore((state) => state.deleteTodo);
  const updateTodoInStore = useTodoStore((state) => state.updateTodo);
  const clearAllInStore = useTodoStore((state) => state.clearAll);
  const clearCompletedInStore = useTodoStore((state) => state.clearCompleted);
  const toggleAllInStore = useTodoStore((state) => state.toggleAll);
  const addManyToStore = useTodoStore((state) => state.addMany);
  const replaceAllInStore = useTodoStore((state) => state.replaceAll);
  const storageReady = useStorageReady();
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategories, setFilterCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('default');
  const [confirmKind, setConfirmKind] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [replaceOnImport, setReplaceOnImport] = useState(false);
  const [infoKind, setInfoKind] = useState(null);
  const [showUtilities, setShowUtilities] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [busyAction, setBusyAction] = useState(null);
  const fileInputRef = useRef(null);
  const utilitiesToggleRef = useRef(null);
  const utilitiesPanelRef = useRef(null);
  const [updateRegistration, setUpdateRegistration] = useState(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    init().catch((error) => {
      if (!active) return;
      console.error('Storage init failed', error);
      setErrorMsg('Storage initialization failed.');
    });
    return () => {
      active = false;
    };
  }, [init]);

  useEffect(() => {
    if (errorMsg || infoMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
        setInfoMsg('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, infoMsg]);

  useEffect(() => {
    try {
      const rawUtilities = window?.localStorage?.getItem('todos_showUtilities');
      if (rawUtilities != null) setShowUtilities(rawUtilities === '1' || rawUtilities === 'true');
      const rawAdvanced = window?.localStorage?.getItem('todos_showAdvanced');
      if (rawAdvanced != null) setShowAdvanced(rawAdvanced === '1' || rawAdvanced === 'true');
    } catch (error) {
      console.warn('Failed to read layout flags', error);
    }
  }, []);

  useEffect(() => {
    try {
      window?.localStorage?.setItem('todos_showUtilities', showUtilities ? '1' : '0');
    } catch (error) {
      console.warn('Failed to persist utilities flag', error);
    }
  }, [showUtilities, utilitiesPanelRef, utilitiesToggleRef]);

  useEffect(() => {
    if (!showUtilities) return undefined;

    const handleClick = (event) => {
      if (utilitiesToggleRef.current?.contains(event.target)) return;
      if (utilitiesPanelRef.current?.contains(event.target)) return;
      setShowUtilities(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setShowUtilities(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showUtilities]);

  useEffect(() => {
    const unsubscribe = subscribeToServiceWorkerUpdate((registration) => {
      if (!registration) return;
      setUpdateRegistration(registration);
      setShowUpdateToast(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToInstallPrompt((available) => {
      setInstallAvailable(available);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      window?.localStorage?.setItem('todos_showAdvanced', showAdvanced ? '1' : '0');
    } catch (error) {
      console.warn('Failed to persist advanced flag', error);
    }
  }, [showAdvanced]);

  const usedCategories = useMemo(() => {
    return Array.from(new Set(todos.map((todo) => (todo.category || '').trim()).filter(Boolean)));
  }, [todos]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...usedCategories]));
  }, [usedCategories]);

  const filteredTodos = useMemo(() => {
    const normalized = filterCategories.map((entry) => entry.trim()).filter(Boolean);
    return todos.filter((todo) => {
      if (filterStatus === 'active' && todo.completed) return false;
      if (filterStatus === 'completed' && !todo.completed) return false;
      if (normalized.length) {
        const category = (todo.category || '').trim();
        if (!normalized.includes(category)) return false;
      }
      if (
        search &&
        !`${todo.text} ${todo.category || ''}`.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [todos, filterStatus, filterCategories, search]);

  useEffect(() => {
    setFilterCategories((current) => {
      const filtered = current.filter((name) => usedCategories.includes(name));
      if (
        filtered.length === current.length &&
        filtered.every((value, index) => value === current[index])
      ) {
        return current;
      }
      return filtered;
    });
  }, [usedCategories]);

  const sortedTodos = useMemo(() => {
    const list = [...filteredTodos];
    list.sort((a, b) => {
      if (sortMode === 'due') {
        const ad = a.dueAt ?? Number.POSITIVE_INFINITY;
        const bd = b.dueAt ?? Number.POSITIVE_INFINITY;
        if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0)) return a.completed ? 1 : -1;
        return ad - bd;
      }
      if (sortMode === 'created') {
        if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0)) return a.completed ? 1 : -1;
        return a.createdAt - b.createdAt;
      }
      if (sortMode === 'priority') {
        const order = { urgent: 0, high: 1, medium: 2, low: 3, veryLow: 4 };
        if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0)) return a.completed ? 1 : -1;
        return (
          order[normalizePriority(a.priority)] - order[normalizePriority(b.priority)] ||
          a.createdAt - b.createdAt
        );
      }
      return a.completed === b.completed ? a.createdAt - b.createdAt : a.completed ? 1 : -1;
    });
    return list;
  }, [filteredTodos, sortMode]);

  const remainingCount = usePendingCount();
  const totalCount = todos.length;
  const completedCount = totalCount - remainingCount;
  const interactionsDisabled = !storageReady || !!busyAction;
  const busyLabel = busyAction ? ACTION_LABELS[busyAction] || 'Working…' : null;

  async function runAction(kind, errorMessage, fn) {
    setBusyAction(kind);
    try {
      return await fn();
    } catch (error) {
      console.error(error);
      if (errorMessage) setErrorMsg(errorMessage);
      throw error;
    } finally {
      setBusyAction((current) => (current === kind ? null : current));
    }
  }

  async function handleInstallApp() {
    const accepted = await triggerInstallPrompt();
    if (accepted) {
      setInfoMsg('App install started.');
    }
  }

  function handleApplyUpdate() {
    if (!updateRegistration) return;
    applyServiceWorkerUpdate(updateRegistration);
    setShowUpdateToast(false);
    setUpdateRegistration(null);
  }

  async function handleAddTodo({ text, category, dueInput, priority, notes }) {
    const trimmed = text.trim();
    if (!trimmed) return false;
    try {
      await runAction('add', 'Failed to add todo.', () =>
        addTodoToStore({
          text: trimmed,
          category,
          dueInput,
          priority: normalizePriority(priority),
          notes,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async function handleToggleTodo(id) {
    try {
      await runAction('toggle', 'Failed to toggle todo.', () => toggleTodoInStore(id));
    } catch {
      /* error already surfaced */
    }
  }

  async function handleDeleteTodo(id) {
    try {
      await runAction('delete', 'Failed to delete todo.', () => deleteTodoFromStore(id));
    } catch {
      /* error already surfaced */
    }
  }

  async function handleUpdateTodo(id, { text, category, dueInput, priority, notes }) {
    const trimmed = text.trim();
    if (!trimmed) return false;
    try {
      const updated = await runAction('update', 'Failed to save edit.', () =>
        updateTodoInStore(id, {
          text: trimmed,
          category,
          dueInput,
          priority: normalizePriority(priority),
          notes,
        }),
      );
      return !!updated;
    } catch {
      return false;
    }
  }

  async function handleClearAll() {
    try {
      await runAction('clearAll', 'Failed to clear list.', () => clearAllInStore());
    } catch {
      /* error already surfaced */
    }
  }

  async function handleClearCompleted() {
    try {
      await runAction('clearCompleted', 'Failed to clear completed.', () =>
        clearCompletedInStore(),
      );
    } catch {
      /* error already surfaced */
    }
  }

  async function handleToggleAll() {
    try {
      await runAction('toggleAll', 'Failed to toggle all.', () => toggleAllInStore());
    } catch {
      /* error already surfaced */
    }
  }

  function requestDelete(todo) {
    if (!todo || todo.completed) return;
    setPendingDelete(todo);
    setConfirmKind('deleteOne');
  }

  function triggerImport() {
    if (interactionsDisabled) return;
    fileInputRef.current?.click();
  }

  async function handleImportFile(event) {
    const file = event.target?.files?.[0];
    if (!file) return;
    try {
      await runAction('import', 'Import failed.', async () => {
        await init();
        const text = await file.text();
        const json = JSON.parse(text);
        const items = Array.isArray(json)
          ? json
          : Array.isArray(json.items)
            ? json.items
            : Array.isArray(json.todos)
              ? json.todos
              : [];
        if (!Array.isArray(items) || items.length === 0) {
          setErrorMsg('No items found in file.');
          return;
        }
        const sanitized = items
          .map((record) => {
            const safeText = record && typeof record.text === 'string' ? record.text : '';
            const safeCategory =
              record && typeof record.category === 'string' ? record.category : '';
            const dueAt =
              record && (typeof record.dueAt === 'number' || typeof record.dueAt === 'string')
                ? Number.isNaN(Number(record.dueAt))
                  ? null
                  : Number(record.dueAt)
                : null;
            const priority = normalizePriority(record?.priority);
            const completed = !!(record && record.completed);
            const createdAt =
              record && typeof record.createdAt === 'number' ? record.createdAt : Date.now();
            const notes = record && typeof record.notes === 'string' ? record.notes : '';
            return {
              text: safeText,
              category: safeCategory,
              dueAt,
              priority,
              completed,
              createdAt,
              notes,
            };
          })
          .filter((item) => item.text.trim().length > 0);
        if (sanitized.length === 0) {
          setErrorMsg('Nothing to import.');
          return;
        }
        if (replaceOnImport) {
          setPendingImport(sanitized);
          setConfirmKind('importReplace');
        } else {
          const added = await addManyToStore(sanitized);
          setInfoMsg(`Imported ${added.length} item(s).`);
        }
      });
    } finally {
      if (event.target) event.target.value = '';
    }
  }

  async function shareList() {
    const incomplete = todos.filter((todo) => !todo.completed);
    const completed = todos.filter((todo) => todo.completed);
    const header = `Todo List (${incomplete.length} open, ${completed.length} done)`;
    const bodyOpen = incomplete.map((todo) => `• ${todo.text}`).join('\n') || '(no open items)';
    const bodyDone = completed.length
      ? '\n\nCompleted:\n' + completed.map((todo) => `✓ ${todo.text}`).join('\n')
      : '';
    const text = header + '\n\n' + bodyOpen + bodyDone;
    const shareData = {
      title: 'My Todo List',
      text,
    };
    if (typeof window !== 'undefined' && window.location) {
      shareData.url = window.location.href;
    }
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share(shareData);
        setInfoMsg('Shared.');
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setInfoMsg('Copied to clipboard.');
      } else {
        setInfoMsg('Sharing not supported.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Share failed.');
    }
  }

  function exportTodos() {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        count: todos.length,
        items: todos.map((todo) => ({
          id: todo.id,
          text: todo.text,
          category: todo.category || '',
          dueAt: typeof todo.dueAt === 'number' ? todo.dueAt : null,
          priority: normalizePriority(todo.priority),
          completed: !!todo.completed,
          createdAt: todo.createdAt || Date.now(),
          notes: todo.notes || '',
        })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `todos-${ts}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setInfoMsg('Exported list.');
    } catch (error) {
      console.error(error);
      setErrorMsg('Export failed.');
    }
  }

  function exportTodosCSV() {
    try {
      const headers = ['text', 'category', 'dueAt', 'priority', 'completed', 'createdAt'];
      const escape = (value) => {
        if (value == null) return '';
        const stringValue = String(value);
        if (/["\n,]/.test(stringValue)) return '"' + stringValue.replace(/"/g, '""') + '"';
        return stringValue;
      };
      const rows = [headers.join(',')].concat(
        todos.map((todo) =>
          [
            escape(todo.text),
            escape(todo.category || ''),
            escape(todo.dueAt ?? ''),
            escape(todo.priority || 'normal'),
            escape(todo.completed ? 1 : 0),
            escape(todo.createdAt || ''),
          ].join(','),
        ),
      );
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `todos-${ts}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setInfoMsg('Exported CSV.');
    } catch (error) {
      console.error(error);
      setErrorMsg('CSV export failed.');
    }
  }

  async function handleConfirmAction() {
    try {
      if (confirmKind === 'clearAll') {
        await handleClearAll();
      } else if (confirmKind === 'clearCompleted') {
        await handleClearCompleted();
      } else if (
        confirmKind === 'importReplace' &&
        Array.isArray(pendingImport) &&
        pendingImport.length
      ) {
        await runAction('import', 'Failed to import todos.', async () => {
          const added = await replaceAllInStore(pendingImport);
          setInfoMsg(`Replaced with ${added.length} item(s).`);
        });
      } else if (confirmKind === 'deleteOne' && pendingDelete) {
        await handleDeleteTodo(pendingDelete.id);
      } else if (confirmKind === 'toggleAll') {
        await handleToggleAll();
      }
    } catch {
      /* errors already communicated */
    } finally {
      setConfirmKind(null);
      setPendingImport(null);
      setPendingDelete(null);
    }
  }

  function closeConfirmDialog() {
    setConfirmKind(null);
    setPendingImport(null);
    setPendingDelete(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-6 overflow-hidden">
      <h1 className="w-full max-w-3xl text-3xl font-extrabold tracking-tight mb-2">
        <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
          😈 DarkTodos&trade;
        </span>
      </h1>
      <HeaderBar
        remainingCount={remainingCount}
        totalCount={totalCount}
        completedCount={completedCount}
        onShare={shareList}
        onExportJson={exportTodos}
        onExportCsv={exportTodosCSV}
        onTriggerImport={triggerImport}
        replaceOnImport={replaceOnImport}
        onReplaceOnImportChange={setReplaceOnImport}
        onShowInfo={setInfoKind}
        canInstall={installAvailable}
        onInstallApp={handleInstallApp}
        updateAvailable={!!updateRegistration}
        onUpdateApp={handleApplyUpdate}
      />
      {!storageReady && (
        <div
          className="w-full max-w-3xl mb-3 px-4 py-2 rounded-xl border border-gray-800 bg-gray-800/70 text-sm text-gray-300"
          role="status"
        >
          Loading your saved todos…
        </div>
      )}
      {storageReady && busyLabel && (
        <div
          className="w-full max-w-3xl mb-3 px-4 py-2 rounded-xl border border-blue-800 bg-blue-900/40 text-sm text-blue-200"
          role="status"
        >
          {busyLabel}
        </div>
      )}
      <AddTodoForm
        onAdd={handleAddTodo}
        categoryOptions={categoryOptions}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced((value) => !value)}
        showUtilities={showUtilities}
        onToggleUtilities={() => setShowUtilities((value) => !value)}
        utilitiesButtonRef={utilitiesToggleRef}
        disabled={interactionsDisabled}
        busyAction={busyAction}
      />
      <div className="w-full max-w-3xl flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
        <TodoUtilities
          ref={utilitiesPanelRef}
          visible={showUtilities}
          totalCount={totalCount}
          completedCount={completedCount}
          onConfirmRequest={setConfirmKind}
          onDismiss={() => setShowUtilities(false)}
          search={search}
          onSearchChange={setSearch}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          categoryOptions={usedCategories}
          selectedCategories={filterCategories}
          onSelectedCategoriesChange={setFilterCategories}
          onResetFilters={() => {
            setFilterStatus('all');
            setFilterCategories([]);
          }}
          disabled={interactionsDisabled}
          busyAction={busyAction}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <TodoList
            todos={sortedTodos}
            onToggleTodo={handleToggleTodo}
            onRequestDelete={requestDelete}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
            categoryOptions={categoryOptions}
            disabled={interactionsDisabled}
            busyAction={busyAction}
          />
        </div>
      </div>
      {showUpdateToast && (
        <div className="fixed bottom-24 right-4 z-40">
          <div className="flex items-center gap-3 rounded-xl border border-blue-700 bg-gray-900/95 px-4 py-3 text-sm text-gray-100 shadow-2xl">
            <div className="flex items-center gap-2">
              <Icon name="info" className="h-4 w-4 text-blue-300" />
              <span>New version available.</span>
            </div>
            <button
              type="button"
              onClick={handleApplyUpdate}
              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-500"
            >
              Refresh now
            </button>
            <button
              type="button"
              onClick={() => setShowUpdateToast(false)}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {errorMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900 px-4 py-2 rounded border border-red-700">
          {errorMsg}
        </div>
      )}
      {infoMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded border border-gray-700">
          {infoMsg}
        </div>
      )}
      <ConfirmDialog
        open={!!confirmKind}
        kind={confirmKind}
        completedCount={completedCount}
        pendingImport={pendingImport}
        pendingDelete={pendingDelete}
        onCancel={closeConfirmDialog}
        onConfirm={handleConfirmAction}
        disabled={!!busyAction}
      />
      <InfoDialog kind={infoKind} onClose={() => setInfoKind(null)} />
      <footer className="fixed bottom-2 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <span className="pointer-events-auto px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-xs text-gray-300 backdrop-blur bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
          <a href="//github.com/Dotjedotcom/darkmode-todo" target="_parent" rel="noreferrer">
            😈 DarkTodos™
          </a>
        </span>
        <span className="pointer-events-auto px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-xs text-gray-300 backdrop-blur bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
          <a href="//dotinga.com" target="_parent" rel="noreferrer">
            ★ Dotjedotcom ★
          </a>
        </span>
      </footer>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={handleImportFile}
      />
    </div>
  );
}
