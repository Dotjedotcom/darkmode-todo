import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';
import TodoFilters from './TodoFilters.jsx';
import CategoryFilterMenu from './CategoryFilterMenu.jsx';

const TodoUtilities = forwardRef(function TodoUtilities(
  {
    visible,
    totalCount,
    completedCount,
    onConfirmRequest,
    onDismiss = () => {},
    search,
    onSearchChange,
    filterStatus,
    onFilterStatusChange,
    sortMode,
    onSortModeChange,
    categoryOptions,
    selectedCategories = [],
    onSelectedCategoriesChange = () => {},
    onResetFilters,
    disabled = false,
    busyAction = null,
  },
  ref,
) {
  if (!visible) return null;

  const isToggleAll = busyAction === 'toggleAll';
  const isClearingCompleted = busyAction === 'clearCompleted';
  const isClearingAll = busyAction === 'clearAll';
  const hasCategoryFilters = selectedCategories.length > 0;

  const handleResetFilters = () => {
    if (typeof onResetFilters === 'function') {
      onResetFilters();
    } else {
      onFilterStatusChange('all');
      onSelectedCategoriesChange([]);
    }
  };

  const actionButtons = [
    {
      key: 'toggleAll',
      icon: 'toggle',
      label: 'Toggle all',
      disabled: disabled,
      busy: isToggleAll,
    },
    {
      key: 'clearCompleted',
      icon: 'broom',
      label: 'Clear completed',
      disabled: disabled || completedCount === 0,
      busy: isClearingCompleted,
    },
    {
      key: 'clearAll',
      icon: 'trash',
      label: 'Clear all',
      disabled: disabled || totalCount === 0,
      busy: isClearingAll,
    },
  ];

  return (
    <div
      ref={ref}
      className="w-full max-w-3xl space-y-3 flex-none"
      aria-busy={busyAction ? 'true' : 'false'}
    >
      <TodoFilters
        search={search}
        onSearchChange={onSearchChange}
        filterStatus={filterStatus}
        onFilterStatusChange={onFilterStatusChange}
        sortMode={sortMode}
        onSortModeChange={onSortModeChange}
        hasCategoryFilters={hasCategoryFilters}
        onRequestReset={handleResetFilters}
        disabled={disabled}
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <CategoryFilterMenu
            categories={categoryOptions}
            selected={selectedCategories}
            onChange={onSelectedCategoriesChange}
            disabled={disabled}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {actionButtons.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => {
                if (disabled || action.disabled) return;
                onConfirmRequest(action.key);
                onDismiss();
              }}
              disabled={action.disabled}
              title={action.label}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-200 transition-colors hover:border-gray-500 ${
                action.disabled ? 'cursor-not-allowed opacity-50' : ''
              } ${action.busy ? 'cursor-wait opacity-80' : ''}`}
            >
              <Icon name={action.icon} className="h-4 w-4" />
              <span className="sr-only">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TodoUtilities;

TodoUtilities.propTypes = {
  visible: PropTypes.bool.isRequired,
  totalCount: PropTypes.number.isRequired,
  completedCount: PropTypes.number.isRequired,
  onConfirmRequest: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterStatus: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  onFilterStatusChange: PropTypes.func.isRequired,
  sortMode: PropTypes.oneOf(['default', 'due', 'created', 'priority']).isRequired,
  onSortModeChange: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectedCategoriesChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func,
  disabled: PropTypes.bool,
  busyAction: PropTypes.string,
};
