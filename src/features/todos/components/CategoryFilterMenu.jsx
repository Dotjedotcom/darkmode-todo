import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';
import useAnchoredPosition from '../../../hooks/useAnchoredPosition.js';
import { categoryIcon } from '../../../utils/category.js';

export default function CategoryFilterMenu({ categories, selected, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(categories.map((entry) => (entry || '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [categories]);

  const selectedSummary = useMemo(() => {
    return Array.from(new Set(selected.map((entry) => entry.trim()).filter(Boolean)));
  }, [selected]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
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
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const popoverStyle = useAnchoredPosition(open && !disabled, buttonRef, menuRef, {
    width: 280,
    deps: [uniqueCategories.length, selected.join('|')],
  });

  const summaryLabel = selected.length === 0 ? 'All categories' : `${selected.length} selected`;

  const toggleCategory = (category) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    const exists = selected.some((entry) => entry === trimmed);
    const next = exists ? selected.filter((entry) => entry !== trimmed) : [...selected, trimmed];
    onChange(next);
  };

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-3">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => !disabled && setOpen((value) => !value)}
        disabled={disabled}
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
          disabled
            ? 'cursor-not-allowed border-gray-800 bg-gray-900 text-gray-500'
            : open || selected.length
              ? 'border-blue-500 bg-blue-900/40 text-blue-100'
              : 'border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500'
        }`}
      >
        <Icon name="tag" />
        <span className="flex flex-col text-left">
          <span>Categories</span>
          <span className="text-xs text-gray-400">{summaryLabel}</span>
        </span>
        {selected.length > 0 && (
          <span className="ml-auto h-2 w-2 rounded-full bg-blue-400" aria-hidden="true" />
        )}
      </button>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {selectedSummary.length === 0 && (
          <span className="rounded-full border border-gray-700 bg-gray-800 px-2 py-1 text-gray-400">
            All categories
          </span>
        )}
        {selectedSummary.map((category) => (
          <span
            key={category}
            className="flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2 py-1 text-gray-100"
          >
            <span className="text-xl leading-none" aria-hidden="true">
              {categoryIcon(category)}
            </span>
            {/* <span>{category}</span> */}
          </span>
        ))}
      </div>
      {open && !disabled && (
        <div
          ref={menuRef}
          style={popoverStyle ?? { visibility: 'hidden' }}
          className="fixed z-50 mt-2 w-72 max-w-[90vw] rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl"
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Select categories</span>
            {selected.length > 0 && (
              <button
                type="button"
                className="text-blue-300 hover:text-blue-100"
                onClick={() => onChange([])}
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-3 grid max-h-64 gap-2 overflow-auto">
            {uniqueCategories.length === 0 && (
              <span className="text-xs text-gray-500">No categories yet.</span>
            )}
            {uniqueCategories.map((category) => {
              const active = selected.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-gray-800 text-blue-100' : 'text-gray-200 hover:bg-gray-800'
                  }`}
                  aria-pressed={active}
                  onClick={() => toggleCategory(category)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      {categoryIcon(category)}
                    </span>
                    <span>{category}</span>
                  </span>
                  {active && <Icon name="check" className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

CategoryFilterMenu.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
