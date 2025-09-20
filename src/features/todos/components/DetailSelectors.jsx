import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';
import { fuzzyFilter } from '../../../utils/fuzzy.js';
import {
  priorityLabel,
  normalizePriority,
  PRIORITY_SCALE,
  priorityGlyph,
} from '../../../utils/priority.js';
import { categoryIcon } from '../../../utils/category.js';
import useAnchoredPosition from '../../../hooks/useAnchoredPosition.js';

const PRIORITY_OPTIONS = PRIORITY_SCALE;

function usePopover(open, setOpen, containerRef) {
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (containerRef.current && containerRef.current.contains(event.target)) return;
      setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, setOpen, containerRef]);
}

export function CategoryPopoverButton({ value = '', onChange, options, disabled = false }) {
  const containerRef = useRef(null);
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  usePopover(open, setOpen, containerRef);
  const popoverStyle = useAnchoredPosition(open, anchorRef, popoverRef, {
    width: 256,
    deps: [inputValue, options.length],
  });

  const suggestionList = useMemo(
    () => fuzzyFilter(options, inputValue).slice(0, 8),
    [options, inputValue],
  );

  function commit(category) {
    setInputValue(category);
    onChange(category);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={anchorRef}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${disabled ? 'border-gray-700 text-gray-500 cursor-not-allowed opacity-60' : 'border-gray-700 hover:border-gray-500 text-gray-200 bg-gray-800'}`}
        disabled={disabled}
      >
        <Icon name="tag" />
        <span className="flex items-center gap-2 truncate max-w-[10rem]">
          <span className="text-base leading-none">{categoryIcon(value)}</span>
        </span>
      </button>
      {open && !disabled && (
        <div
          ref={popoverRef}
          style={popoverStyle ?? { visibility: 'hidden' }}
          className="fixed z-50 rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl"
          data-editing-surface="true"
        >
          <input
            className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100"
            placeholder="Category"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              setHighlight(0);
            }}
            onKeyDown={(event) => {
              const max = suggestionList.length;
              if (event.key === 'Enter') {
                event.preventDefault();
                if (max) {
                  const picked = suggestionList[Math.min(highlight, max - 1)];
                  commit(picked);
                } else {
                  commit(inputValue.trim());
                }
              } else if (event.key === 'ArrowDown' && max) {
                event.preventDefault();
                setHighlight((h) => (h + 1) % max);
              } else if (event.key === 'ArrowUp' && max) {
                event.preventDefault();
                setHighlight((h) => (h - 1 + max) % max);
              }
            }}
          />
          <div className="mt-2 max-h-40 overflow-auto rounded border border-gray-800">
            {suggestionList.map((entry, index) => (
              <button
                key={entry}
                type="button"
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${index === highlight ? 'bg-gray-800 text-gray-100' : 'text-gray-200 hover:bg-gray-800'}`}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(entry);
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{categoryIcon(entry)}</span>
                  <span className="text-sm">{entry}</span>
                </span>
              </button>
            ))}
            {suggestionList.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-500">
                Press Enter to use “{inputValue || 'category'}”.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

CategoryPopoverButton.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool,
};

export function DatePopoverButton({ value = '', onChange, disabled = false }) {
  const containerRef = useRef(null);
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);

  usePopover(open, setOpen, containerRef);
  const popoverStyle = useAnchoredPosition(open, anchorRef, popoverRef, {
    width: 224,
    deps: [value],
  });

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={anchorRef}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${disabled ? 'border-gray-700 text-gray-500 cursor-not-allowed opacity-60' : 'border-gray-700 hover:border-gray-500 text-gray-200 bg-gray-800'}`}
        disabled={disabled}
      >
        <Icon name="calendar" />
      </button>
      {open && !disabled && (
        <div
          ref={popoverRef}
          style={popoverStyle ?? { visibility: 'hidden' }}
          className="fixed z-50 rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl"
          data-editing-surface="true"
        >
          <input
            type="date"
            className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2 text-xs">
            <button
              type="button"
              className="rounded bg-gray-800 px-2 py-1 text-gray-200 hover:bg-gray-700"
              onMouseDown={(event) => {
                event.preventDefault();
                onChange('');
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-500"
              onMouseDown={(event) => {
                event.preventDefault();
                setOpen(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

DatePopoverButton.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export function PriorityPopoverButton({ value = 'medium', onChange, disabled = false }) {
  const containerRef = useRef(null);
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const current = normalizePriority(value) || 'medium';

  usePopover(open, setOpen, containerRef);
  const popoverStyle = useAnchoredPosition(open, anchorRef, popoverRef, {
    width: 192,
    deps: [current],
  });

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={anchorRef}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${disabled ? 'border-gray-700 text-gray-500 cursor-not-allowed opacity-60' : 'border-gray-700 hover:border-gray-500 text-gray-200 bg-gray-800'}`}
        disabled={disabled}
      >
        <Icon name="flag" />
      </button>
      {open && !disabled && (
        <div
          ref={popoverRef}
          style={popoverStyle ?? { visibility: 'hidden' }}
          className="fixed z-50 rounded-lg border border-gray-700 bg-gray-900 p-2 shadow-xl"
          data-editing-surface="true"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                option === current ? 'bg-gray-800 text-gray-100' : 'text-gray-200 hover:bg-gray-800'
              }`}
              onMouseDown={(event) => {
                event.preventDefault();
                onChange(option);
                setOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {priorityGlyph(option)}
                </span>
                {priorityLabel(option)}
              </span>
              {option === current && <Icon name="check" className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NotesPopoverButton({ value = '', onChange, disabled = false }) {
  const containerRef = useRef(null);
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || '');

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  usePopover(open, setOpen, containerRef);
  const popoverStyle = useAnchoredPosition(open, anchorRef, popoverRef, {
    width: 288,
    deps: [draft],
  });

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={anchorRef}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${disabled ? 'border-gray-700 text-gray-500 cursor-not-allowed opacity-60' : 'border-gray-700 hover:border-gray-500 text-gray-200 bg-gray-800'}`}
        disabled={disabled}
      >
        <Icon name="notes" />
      </button>
      {open && !disabled && (
        <div
          ref={popoverRef}
          style={popoverStyle ?? { visibility: 'hidden' }}
          className="fixed z-50 rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl"
          data-editing-surface="true"
        >
          <textarea
            className="h-32 w-full resize-none rounded border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100"
            placeholder="Add additional context…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="mt-3 flex justify-end gap-2 text-xs">
            <button
              type="button"
              className="rounded bg-gray-800 px-2 py-1 text-gray-200 hover:bg-gray-700"
              onMouseDown={(event) => {
                event.preventDefault();
                setDraft('');
                onChange('');
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-500"
              onMouseDown={(event) => {
                event.preventDefault();
                onChange(draft.trim());
                setOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

NotesPopoverButton.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

PriorityPopoverButton.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
