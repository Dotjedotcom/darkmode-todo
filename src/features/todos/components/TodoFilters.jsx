import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';

export default function TodoFilters({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
  sortMode,
  onSortModeChange,
  categoryOptions,
  disabled = false,
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-gray-700 bg-gray-800/80 p-3">
      <div className="flex items-center justify-between gap-2">
        {['all', 'active', 'completed'].map((status) => {
          const icon = status === 'all' ? 'list' : status === 'active' ? 'circle' : 'check-circle';
          const label = status.charAt(0).toUpperCase() + status.slice(1);
          const active = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => !disabled && onFilterStatusChange(status)}
              aria-pressed={active}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-sm transition-colors ${
                active ? 'border-gray-500 bg-gray-700 text-gray-100' : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
              } disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={disabled}
              type="button"
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search"
        className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
      />
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
          <span>Category</span>
          <select
            value={filterCategory}
            onChange={(event) => onFilterCategoryChange(event.target.value)}
            className="tw-select w-full"
            disabled={disabled}
          >
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
          <span>Sort</span>
          <select
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value)}
            className="tw-select w-full"
            disabled={disabled}
          >
            <option value="default">Default</option>
            <option value="due">Due date</option>
            <option value="created">Created</option>
            <option value="priority">Priority</option>
          </select>
        </label>
      </div>
    </div>
  );
}

TodoFilters.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterStatus: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  onFilterStatusChange: PropTypes.func.isRequired,
  filterCategory: PropTypes.string.isRequired,
  onFilterCategoryChange: PropTypes.func.isRequired,
  sortMode: PropTypes.oneOf(['default', 'due', 'created', 'priority']).isRequired,
  onSortModeChange: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool,
};

TodoFilters.defaultProps = {
  disabled: false,
};
