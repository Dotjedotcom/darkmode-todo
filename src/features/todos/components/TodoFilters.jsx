import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';
import useAnchoredPosition from '../../../hooks/useAnchoredPosition.js';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All tasks', icon: 'list' },
  { value: 'active', label: 'Active', icon: 'circle' },
  { value: 'completed', label: 'Completed', icon: 'check-circle' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Default order' },
  { value: 'due', label: 'Due date' },
  { value: 'created', label: 'Created' },
  { value: 'priority', label: 'Priority' },
];

export default function TodoFilters({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  sortMode,
  onSortModeChange,
  onRequestReset,
  disabled = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClick = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      setMenuOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!disabled) return;
    setMenuOpen(false);
  }, [disabled]);

  const popoverStyle = useAnchoredPosition(menuOpen && !disabled, buttonRef, menuRef, {
    width: 288,
    deps: [filterStatus, sortMode],
  });

  const sortSummary = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === sortMode)?.label ?? 'Default order',
    [sortMode],
  );
  const statusSummary = useMemo(
    () => STATUS_OPTIONS.find((option) => option.value === filterStatus)?.label ?? 'All tasks',
    [filterStatus],
  );
  const hasActiveFilters = filterStatus !== 'all';

  return (
    <div className="grid gap-3 rounded-xl border border-gray-700 bg-gray-800/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search"
          className="flex-1 min-w-[200px] rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          type="search"
        />
        <div ref={containerRef} className="relative">
          <button
            type="button"
            ref={buttonRef}
            onClick={() => !disabled && setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            className={`flex min-w-[180px] items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              disabled
                ? 'cursor-not-allowed border-gray-800 bg-gray-900 text-gray-500'
                : menuOpen
                  ? 'border-gray-500 bg-gray-800 text-gray-100'
                  : 'border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500'
            }`}
            disabled={disabled}
          >
            <Icon name="sort" />
            <span className="flex flex-col">
              <span>Sort & Filter</span>
              <span className="text-xs text-gray-400">
                {sortSummary}
                {hasActiveFilters && ` · ${statusSummary}`}
              </span>
            </span>
            {hasActiveFilters && (
              <span className="ml-auto h-2 w-2 rounded-full bg-blue-400" aria-hidden="true" />
            )}
          </button>
          {menuOpen && !disabled && (
            <div
              ref={menuRef}
              style={popoverStyle ?? { visibility: 'hidden' }}
              className="fixed z-50 w-72 max-w-[90vw] rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-100 shadow-xl"
            >
              <div className="space-y-4">
                <section>
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Sort by</p>
                  <div className="grid gap-1">
                    {SORT_OPTIONS.map((option) => {
                      const active = sortMode === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                            active ? 'bg-gray-800 text-gray-50' : 'text-gray-200 hover:bg-gray-800'
                          }`}
                          aria-pressed={active}
                          onClick={() => onSortModeChange(option.value)}
                        >
                          {option.label}
                          {active && <Icon name="check" className="h-3.5 w-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </section>
                <section>
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Status</p>
                  <div className="grid gap-1">
                    {STATUS_OPTIONS.map((option) => {
                      const active = filterStatus === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                            active ? 'bg-gray-800 text-gray-50' : 'text-gray-200 hover:bg-gray-800'
                          }`}
                          aria-pressed={active}
                          onClick={() => onFilterStatusChange(option.value)}
                        >
                          <Icon name={option.icon} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-700 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-gray-500 hover:text-gray-100"
                    onClick={() => {
                      if (onRequestReset) onRequestReset();
                      else onFilterStatusChange('all');
                    }}
                  >
                    <Icon name="refresh" className="h-3.5 w-3.5" />
                    Reset filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

TodoFilters.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterStatus: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  onFilterStatusChange: PropTypes.func.isRequired,
  sortMode: PropTypes.oneOf(['default', 'due', 'created', 'priority']).isRequired,
  onSortModeChange: PropTypes.func.isRequired,
  onRequestReset: PropTypes.func,
  disabled: PropTypes.bool,
};

TodoFilters.defaultProps = {
  onRequestReset: undefined,
  disabled: false,
};
