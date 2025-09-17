import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';
import { priorityLabel } from '../../../utils/priority.js';
import { categoryPillClass, categoryIcon } from '../../../utils/category.js';
import { toLocalDateInput } from '../../../utils/date.js';
import {
  CategoryPopoverButton,
  DatePopoverButton,
  NotesPopoverButton,
  PriorityPopoverButton,
} from './DetailSelectors.jsx';

const PRIORITY_BORDER = {
  high: 'border-red-600',
  normal: 'border-amber-500',
  low: 'border-emerald-500',
};

const PRIORITY_BADGE = {
  high: 'bg-red-900/40 border-red-600 text-red-200',
  normal: 'bg-amber-900/30 border-amber-500 text-amber-200',
  low: 'bg-emerald-900/30 border-emerald-500 text-emerald-200',
};

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export default function TodoList({
  todos,
  onToggleTodo,
  onRequestDelete,
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
  const [editPriority, setEditPriority] = useState('normal');
  const [editNotes, setEditNotes] = useState('');
  const editInputRef = useRef(null);

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
    setEditPriority(todo.priority || 'normal');
    setEditNotes(todo.notes || '');
  }

  function resetEditState() {
    setEditingId(null);
    setEditText('');
    setEditCategory('');
    setEditDue('');
    setEditPriority('normal');
    setEditNotes('');
  }

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
      priority: editPriority || 'normal',
      notes: editNotes.trim(),
    });
    if (success) {
      resetEditState();
    }
  }

  function cancelEdit() {
    resetEditState();
  }

  return (
    <div
      className="h-[calc(100vh-20rem)] w-full max-w-3xl overflow-y-auto overflow-x-hidden"
      aria-busy={busyAction ? 'true' : 'false'}
    >
      <ul id="list" className="space-y-2">
        {todos.map((todo) => {
          const priorityKey = todo.priority || 'normal';
          const borderClass = PRIORITY_BORDER[priorityKey] ?? 'border-gray-700';
          const badgeClass = PRIORITY_BADGE[priorityKey] ?? 'bg-gray-800 border-gray-600 text-gray-200';
          const isEditing = editingId === todo.id;
          const overdue = !!todo.dueAt && !todo.completed && todo.dueAt < Date.now();
          const dueLabel = todo.dueAt ? DATE_FORMATTER.format(new Date(todo.dueAt)) : 'No due date';

          return (
            <li
              key={todo.id}
              className={`group rounded-xl border ${borderClass} bg-gray-800/95 p-3 transition-colors shadow-sm ${
                todo.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => !disabled && onToggleTodo(todo.id)}
                  className="flex h-6 w-6 min-w-[1.5rem] items-center justify-center rounded border border-gray-500 bg-gray-900 text-sm text-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                >
                  {todo.completed ? <Icon name="check" className="h-3.5 w-3.5" /> : ''}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        ref={editInputRef}
                        className="flex-1 rounded border border-gray-700 bg-gray-900 p-2 text-sm text-gray-100"
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
                        className={`flex-1 truncate text-sm ${
                          todo.completed ? 'line-through text-gray-500' : 'text-gray-100'
                        }`}
                        title={todo.text}
                        onDoubleClick={() => beginEdit(todo)}
                      >
                        {todo.text}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      {isEditing ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => !todo.completed && beginEdit(todo)}
                            disabled={todo.completed || disabled}
                            className="px-2 text-gray-400 opacity-0 transition-opacity duration-150 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Edit"
                          >
                            <Icon name="edit" />
                          </button>
                          <button
                            onClick={() => !todo.completed && !disabled && onRequestDelete(todo)}
                            disabled={todo.completed || disabled}
                            className="px-2 text-red-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Delete"
                          >
                            <Icon name="trash" />
                          </button>
                        </>
                      )}
                    </div>
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
                        <DatePopoverButton value={editDue} onChange={setEditDue} disabled={disabled} />
                        <PriorityPopoverButton
                          value={editPriority}
                          onChange={setEditPriority}
                          disabled={disabled}
                        />
                        <NotesPopoverButton value={editNotes} onChange={setEditNotes} disabled={disabled} />
                      </>
                    ) : (
                      <>
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${
                            todo.category ? categoryPillClass(todo.category) : 'border-gray-700 text-gray-400'
                          }`}
                        >
                          <span>{categoryIcon(todo.category)}</span>
                          <span>{todo.category || 'Uncategorised'}</span>
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                            overdue ? 'border-red-500 text-red-200' : 'border-gray-700 text-gray-300'
                          }`}
                        >
                          <Icon name="calendar" className="h-3.5 w-3.5" />
                          {dueLabel}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {priorityLabel(priorityKey)}
                        </span>
                      </>
                    )}
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
      completed: PropTypes.bool.isRequired,
      createdAt: PropTypes.number.isRequired,
    }),
  ).isRequired,
  onToggleTodo: PropTypes.func.isRequired,
  onRequestDelete: PropTypes.func.isRequired,
  onUpdateTodo: PropTypes.func.isRequired,
  onDeleteTodo: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool,
  busyAction: PropTypes.string,
};

TodoList.defaultProps = {
  disabled: false,
  busyAction: null,
};
