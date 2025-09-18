import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';
import { defaultDateLocal } from '../../../utils/date.js';
import {
  CategoryPopoverButton,
  DatePopoverButton,
  NotesPopoverButton,
  PriorityPopoverButton,
} from './DetailSelectors.jsx';

export default function AddTodoForm({
  onAdd,
  categoryOptions,
  showAdvanced,
  onToggleAdvanced,
  showUtilities,
  onToggleUtilities,
  utilitiesButtonRef,
  disabled = false,
  busyAction = null,
}) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setDue(defaultDateLocal());
  }, []);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const isBusy = busyAction === 'add';

  async function handleSubmit() {
    if (disabled) return false;
    const success = await onAdd({
      text,
      category,
      dueInput: due,
      priority,
      notes,
    });
    if (success) {
      setText('');
      setCategory('');
      setDue(defaultDateLocal());
      setPriority('normal');
      setNotes('');
    }
  }

  function handleSubmitShortcut(event) {
    if (disabled) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div id="add" className="w-full max-w-3xl flex flex-wrap gap-2 mb-3" aria-busy={isBusy}>
      <input
        className="flex-1 min-w-[120px] p-3 rounded-xl bg-gray-800 border border-gray-700"
        placeholder="What needs doing?"
        value={text}
        onChange={(event) => !disabled && setText(event.target.value)}
        onKeyDown={handleSubmitShortcut}
        disabled={disabled}
        ref={inputRef}
      />
      <button
        onClick={onToggleAdvanced}
        aria-pressed={showAdvanced}
        aria-expanded={showAdvanced}
        className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${showAdvanced ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-800'}`}
        title={showAdvanced ? 'Hide options' : 'More options'}
        disabled={disabled}
      >
        <Icon name="tune" />
        <span className="sr-only">{showAdvanced ? 'Hide options' : 'More options'}</span>
      </button>
      <button
        onClick={handleSubmit}
        className={`px-4 rounded-xl flex items-center gap-2 ${isBusy ? 'bg-blue-500 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'}`}
        title="Add"
        disabled={disabled || isBusy}
      >
        <Icon name="plus" className={isBusy ? 'animate-spin' : undefined} />
        {isBusy && <span className="text-sm">Saving…</span>}
      </button>
      <button
        ref={utilitiesButtonRef}
        onClick={onToggleUtilities}
        aria-pressed={showUtilities}
        aria-expanded={showUtilities}
        className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${showUtilities ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-800'}`}
        title={showUtilities ? 'Hide utilities' : 'Show utilities'}
        disabled={disabled}
      >
        <Icon name="sliders" />
        <span className="sr-only">Toggle utilities</span>
      </button>
      {showAdvanced && (
        <div id="options" className="w-full max-w-3xl flex flex-wrap gap-2 mb-0">
          <CategoryPopoverButton
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            disabled={disabled}
          />
          <DatePopoverButton value={due} onChange={setDue} disabled={disabled} />
          <PriorityPopoverButton value={priority} onChange={setPriority} disabled={disabled} />
          <NotesPopoverButton value={notes} onChange={setNotes} disabled={disabled} />
        </div>
      )}
    </div>
  );
}

AddTodoForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  showAdvanced: PropTypes.bool.isRequired,
  onToggleAdvanced: PropTypes.func.isRequired,
  showUtilities: PropTypes.bool.isRequired,
  onToggleUtilities: PropTypes.func.isRequired,
  utilitiesButtonRef: PropTypes.shape({ current: PropTypes.any }),
  disabled: PropTypes.bool,
  busyAction: PropTypes.string,
};

AddTodoForm.defaultProps = {
  disabled: false,
  busyAction: null,
  utilitiesButtonRef: undefined,
};
