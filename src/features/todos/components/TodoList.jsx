import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';
import { priorityLabel, priorityGlyph, normalizePriority } from '../../../utils/priority.js';
import { categoryPillClass, categoryIcon } from '../../../utils/category.js';
import { toLocalDateInput } from '../../../utils/date.js';
import {
  CategoryPopoverButton,
  DatePopoverButton,
  NotesPopoverButton,
  PriorityPopoverButton,
} from './DetailSelectors.jsx';
import useAnchoredPosition from '../../../hooks/useAnchoredPosition.js';

const PRIORITY_BORDER = {
  veryLow: 'border-green-700',
  low: 'border-emerald-600',
  medium: 'border-amber-500',
  high: 'border-orange-600',
  urgent: 'border-red-700',
};

const PRIORITY_GLYPH_COLOR = {
  veryLow: 'text-green-300',
  low: 'text-emerald-300',
  medium: 'text-amber-300',
  high: 'text-orange-300',
  urgent: 'text-red-300',
};

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export default function TodoList({
  todos,
  onToggleTodo,
  onUpdateTodo,
  onDeleteTodo,
  categoryOptions,
  disabled = false,
  busyAction = null,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDue, setEditDue] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editNotes, setEditNotes] = useState('');
  const editInputRef = useRef(null);
  const swipeStateRef = useRef({ id: null });
  const swipePreviewTargetRef = useRef({ id: null, offset: 0, action: null });
  const swipePreviewFrameRef = useRef(null);
  const [swipePreview, setSwipePreview] = useState({ id: null, offset: 0, action: null });

  const requestFrame = useCallback((callback) => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      return window.requestAnimationFrame(callback);
    }
    return setTimeout(callback, 16);
  }, []);

  const cancelFrame = useCallback((handle) => {
    if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(handle);
    } else {
      clearTimeout(handle);
    }
  }, []);

  useEffect(() => {
    if (editingId != null) {
      setTimeout(() => editInputRef.current?.focus(), 0);
    }
  }, [editingId]);

  function beginEdit(todo) {
    if (disabled || todo.completed) return;
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditCategory(todo.category || '');
    setEditDue(todo.dueAt ? toLocalDateInput(todo.dueAt) : '');
    setEditPriority(normalizePriority(todo.priority));
    setEditNotes(todo.notes || '');
  }

  const resetEditState = useCallback(() => {
    setEditingId(null);
    setEditText('');
    setEditCategory('');
    setEditDue('');
    setEditPriority('medium');
    setEditNotes('');
  }, []);

  async function commitEdit() {
    if (editingId == null) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      await onDeleteTodo(editingId);
      resetEditState();
      return;
    }
    const success = await onUpdateTodo(editingId, {
      text: trimmed,
      category: editCategory.trim(),
      dueInput: editDue,
      priority: normalizePriority(editPriority),
      notes: editNotes.trim(),
    });
    if (success) {
      resetEditState();
    }
  }

  const cancelEdit = useCallback(() => {
    resetEditState();
  }, [resetEditState]);

  const scheduleSwipePreview = useCallback(
    (next) => {
      swipePreviewTargetRef.current = next;
      if (swipePreviewFrameRef.current != null) return;
      swipePreviewFrameRef.current = requestFrame(() => {
        swipePreviewFrameRef.current = null;
        const target = swipePreviewTargetRef.current;
        setSwipePreview((prev) => {
          if (
            prev.id === target.id &&
            prev.offset === target.offset &&
            prev.action === target.action
          ) {
            return prev;
          }
          return target;
        });
      });
    },
    [requestFrame],
  );

  useEffect(() => {
    return () => {
      if (swipePreviewFrameRef.current != null) {
        cancelFrame(swipePreviewFrameRef.current);
      }
    };
  }, [cancelFrame]);

  const handleSwipeStart = useCallback(
    (event, todoId, completed, isEditing) => {
      if (disabled || isEditing) return;
      if (editingId != null && editingId !== todoId) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = event.target;
      if (target instanceof Element) {
        if (target.closest('button, input, textarea, select, a, label')) return;
      }
      swipeStateRef.current = {
        id: todoId,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        completed,
        cancelled: false,
        locked: false,
      };
      scheduleSwipePreview({ id: todoId, offset: 0, action: null });
      if (event.currentTarget && typeof event.currentTarget.setPointerCapture === 'function') {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    },
    [disabled, editingId, scheduleSwipePreview],
  );

  const handleSwipeMove = useCallback(
    (event) => {
      const state = swipeStateRef.current;
      if (!state || state.id == null || state.pointerId !== event.pointerId) return;
      if (state.cancelled) return;

      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (!state.locked) {
        if (absY > absX + 6) {
          state.cancelled = true;
          scheduleSwipePreview({ id: null, offset: 0, action: null });
          return;
        }
        if (absX > 8) {
          state.locked = true;
        }
      }

      if (!state.locked) {
        scheduleSwipePreview({ id: state.id, offset: 0, action: null });
        return;
      }

      if (absY > absX + 10) {
        state.cancelled = true;
        scheduleSwipePreview({ id: null, offset: 0, action: null });
        return;
      }

      event.preventDefault();

      const action =
        dx > 0 && !state.completed ? 'complete' : dx < 0 && state.completed ? 'reopen' : null;

      if (!action || absX < 12) {
        scheduleSwipePreview({ id: state.id, offset: 0, action: null });
        return;
      }

      const maxOffset = 160;
      const offset = Math.max(Math.min(dx, maxOffset), -maxOffset);

      scheduleSwipePreview({
        id: state.id,
        offset,
        action,
      });
    },
    [scheduleSwipePreview],
  );

  const handleSwipeEnd = useCallback(
    (event, todoId) => {
      const state = swipeStateRef.current;
      if (!state || state.id !== todoId || state.pointerId !== event.pointerId) {
        return;
      }
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const threshold = 60;
      if (!state.cancelled && absX > absY && absX >= threshold) {
        if (dx > 0 && !state.completed) {
          onToggleTodo(todoId);
        } else if (dx < 0 && state.completed) {
          onToggleTodo(todoId);
        }
      }
      if (
        event.currentTarget &&
        typeof event.currentTarget.releasePointerCapture === 'function' &&
        event.currentTarget.hasPointerCapture?.(event.pointerId)
      ) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      scheduleSwipePreview({ id: null, offset: 0, action: null });
      swipeStateRef.current = { id: null };
    },
    [onToggleTodo, scheduleSwipePreview],
  );

  const handleSwipeCancel = useCallback(
    (event) => {
      const state = swipeStateRef.current;
      if (state && state.pointerId === event.pointerId) {
        if (
          event.currentTarget &&
          typeof event.currentTarget.releasePointerCapture === 'function' &&
          event.currentTarget.hasPointerCapture?.(event.pointerId)
        ) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        scheduleSwipePreview({ id: null, offset: 0, action: null });
        swipeStateRef.current = { id: null };
      }
    },
    [scheduleSwipePreview],
  );

  useEffect(() => {
    if (editingId == null) return undefined;
    const handleClick = (event) => {
      const editingNode = document.querySelector('[data-editing="true"]');
      if (!editingNode) return;
      if (editingNode.contains(event.target)) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[data-editing-surface="true"]')) return;
      cancelEdit();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [editingId, cancelEdit]);

  return (
    <div className="h-full w-full" aria-busy={busyAction ? 'true' : 'false'}>
      <div id="list" className="h-full overflow-y-auto overflow-x-hidden overscroll-contain pr-2">
        <ul className="space-y-2 pb-28">
          {todos.map((todo) => {
            const priorityKey = normalizePriority(todo.priority);
            const borderClass = PRIORITY_BORDER[priorityKey] ?? 'border-gray-700';
            const hasNotes = !!(todo.notes && todo.notes.trim());
            const isEditing = editingId === todo.id;
            const overdue = !!todo.dueAt && !todo.completed && todo.dueAt < Date.now();
            const dueLabel = todo.dueAt
              ? DATE_FORMATTER.format(new Date(todo.dueAt))
              : 'No due date';
            const isSwipeActive = swipePreview.id === todo.id;
            const swipeAction = isSwipeActive ? swipePreview.action : null;
            const swipeOffset = isSwipeActive ? swipePreview.offset : 0;
            const completeActive = isSwipeActive && swipeAction === 'complete';
            const reopenActive = isSwipeActive && swipeAction === 'reopen';

            return (
              <li
                key={todo.id}
                data-editing={isEditing ? 'true' : undefined}
                className={`group relative select-none touch-pan-y rounded-xl overflow-hidden ${
                  completeActive ? 'bg-emerald-950/30' : reopenActive ? 'bg-sky-950/30' : ''
                }`}
                onDoubleClick={() => !isEditing && !todo.completed && beginEdit(todo)}
                onPointerDown={(event) =>
                  handleSwipeStart(event, todo.id, !!todo.completed, isEditing)
                }
                onPointerMove={handleSwipeMove}
                onPointerUp={(event) => handleSwipeEnd(event, todo.id)}
                onPointerCancel={handleSwipeCancel}
                onPointerLeave={handleSwipeCancel}
              >
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-wide">
                  <div
                    className={`flex items-center gap-2 text-emerald-300 transition-opacity duration-150 ${
                      completeActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Icon name="check" className="h-4 w-4" />
                    <span>Complete</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sky-300 transition-opacity duration-150 ${
                      reopenActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Icon name="toggle" className="h-4 w-4" />
                    <span>Reopen</span>
                  </div>
                </div>
                <div
                  className={`relative rounded-xl border ${borderClass} bg-gray-800/95 p-3 shadow-sm transition-colors transition-transform duration-150 ease-out ${
                    todo.completed ? 'opacity-60' : ''
                  } ${isSwipeActive ? 'will-change-transform' : ''}`}
                  style={
                    isSwipeActive
                      ? {
                          transform: `translateX(${swipeOffset}px)`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="flex w-8 flex-col items-center gap-1">
                      <button
                        onClick={() => !disabled && onToggleTodo(todo.id)}
                        className="flex h-6 w-6 min-w-[1.5rem] items-center justify-center rounded border border-gray-500 bg-gray-900 text-sm text-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={disabled}
                      >
                        {todo.completed ? <Icon name="check" className="h-3.5 w-3.5" /> : ''}
                      </button>
                      <span
                        className={`mt-1 text-xl leading-none ${
                          PRIORITY_GLYPH_COLOR[priorityKey] ?? 'text-gray-300'
                        }`}
                        title={priorityLabel(priorityKey)}
                        aria-label={`Priority ${priorityLabel(priorityKey)}`}
                      >
                        {priorityGlyph(priorityKey)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 shadow-inner focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
                            value={editText}
                            onChange={(event) => setEditText(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Escape') cancelEdit();
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                commitEdit();
                              }
                            }}
                            disabled={disabled}
                          />
                        ) : (
                          <span
                            className={`flex-1 break-words pr-4 text-sm leading-snug ${
                              todo.completed ? 'line-through text-gray-500' : 'text-gray-100'
                            } line-clamp-3`}
                            title={todo.text}
                            onDoubleClick={() => beginEdit(todo)}
                          >
                            {todo.text}
                          </span>
                        )}
                        {isEditing && (
                          <div className="flex items-center gap-2 text-sm">
                            <button
                              onClick={disabled ? undefined : commitEdit}
                              className="rounded bg-green-600 p-2 text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={disabled}
                            >
                              <Icon name="check" />
                              <span className="sr-only">Save</span>
                            </button>
                            <button
                              onClick={disabled ? undefined : cancelEdit}
                              className="rounded bg-red-600 p-2 text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={disabled}
                            >
                              <Icon name="x" />
                              <span className="sr-only">Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                        {isEditing ? (
                          <>
                            <CategoryPopoverButton
                              value={editCategory}
                              onChange={setEditCategory}
                              options={categoryOptions}
                              disabled={disabled}
                            />
                            <DatePopoverButton
                              value={editDue}
                              onChange={setEditDue}
                              disabled={disabled}
                            />
                            <PriorityPopoverButton
                              value={editPriority}
                              onChange={setEditPriority}
                              disabled={disabled}
                            />
                            <NotesPopoverButton
                              value={editNotes}
                              onChange={setEditNotes}
                              disabled={disabled}
                            />
                          </>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                                todo.category
                                  ? `${categoryPillClass(todo.category)} text-lg`
                                  : 'border-gray-700 bg-gray-800/60 text-gray-400'
                              }`}
                              title={todo.category || 'Uncategorised'}
                              aria-label={
                                todo.category ? `Category ${todo.category}` : 'Uncategorised'
                              }
                            >
                              <span className="text-xl leading-none">
                                {categoryIcon(todo.category)}
                              </span>
                            </span>
                            <span
                              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                                overdue
                                  ? 'border-red-500 text-red-200'
                                  : 'border-gray-700 text-gray-300'
                              }`}
                            >
                              <Icon name="calendar" className="h-3.5 w-3.5" />
                              {dueLabel}
                            </span>
                            {hasNotes && <NotesPreview notes={todo.notes} />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          {todos.length === 0 && (
            <li className="text-center text-gray-400 bg-gray-800 border border-gray-700 rounded-xl p-5 w-full">
              <img
                src="/android-chrome-512x512.png"
                alt="DarkTodos"
                className="h-10 w-10 inline-block align-middle"
              />{' '}
              No todos yet{' '}
              <img
                src="/android-chrome-512x512.png"
                alt="DarkTodos"
                className="h-10 w-10 inline-block align-middle"
              />
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function NotesPreview({ notes = '' }) {
  const trimmed = (notes || '').trim();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const style = useAnchoredPosition(open, buttonRef, popoverRef, {
    width: 260,
    deps: [trimmed],
  });

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (buttonRef.current?.contains(event.target)) return;
      if (popoverRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!trimmed) return null;

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-200 transition-colors hover:border-gray-500 ${
          open ? 'border-blue-500 text-blue-100' : ''
        }`}
        aria-expanded={open}
      >
        <Icon name="notes" className="h-4 w-4" />
        <span className="sr-only">Show additional context</span>
      </button>
      {open && (
        <div
          ref={popoverRef}
          style={style ?? { visibility: 'hidden' }}
          className="fixed z-50 mt-2 w-64 max-w-sm rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-100 shadow-xl"
        >
          <p className="whitespace-pre-wrap break-words text-gray-200">{trimmed}</p>
        </div>
      )}
    </div>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      category: PropTypes.string,
      dueAt: PropTypes.number,
      priority: PropTypes.string,
      notes: PropTypes.string,
      completed: PropTypes.bool.isRequired,
      createdAt: PropTypes.number.isRequired,
    }),
  ).isRequired,
  onToggleTodo: PropTypes.func.isRequired,
  onUpdateTodo: PropTypes.func.isRequired,
  onDeleteTodo: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool,
  busyAction: PropTypes.string,
};

NotesPreview.propTypes = {
  notes: PropTypes.string,
};
