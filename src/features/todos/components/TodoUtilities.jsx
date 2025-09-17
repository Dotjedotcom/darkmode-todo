import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';

const TodoUtilities = forwardRef(function TodoUtilities(
  {
    visible,
    totalCount,
    completedCount,
    onConfirmRequest,
    onDismiss,
    disabled = false,
    busyAction = null,
  },
  ref,
) {
  if (!visible) return null;

  const isToggleAll = busyAction === 'toggleAll';
  const isClearingCompleted = busyAction === 'clearCompleted';
  const isClearingAll = busyAction === 'clearAll';
  const pendingCount = Math.max(0, totalCount - completedCount);

  const handleDismiss = () => {
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  return (
    <div
      ref={ref}
      id="utility"
      className="grid w-full max-w-3xl gap-3 grid-cols-3"
      aria-busy={busyAction ? 'true' : 'false'}
    >
      <UtilityButton
        icon="toggle"
        label="Toggle all"
        description="Flip every todo between done and pending"
        onClick={() => {
          onConfirmRequest('toggleAll');
          handleDismiss();
        }}
        disabled={disabled}
        busy={isToggleAll}
      />
      <UtilityButton
        icon="broom"
        label="Clear completed"
        description="Remove finished todos"
        onClick={() => {
          onConfirmRequest('clearCompleted');
          handleDismiss();
        }}
        disabled={disabled || completedCount === 0}
        busy={isClearingCompleted}
      />
      <UtilityButton
        icon="trash"
        label="Clear all"
        description="Start with an empty list"
        onClick={() => {
          onConfirmRequest('clearAll');
          handleDismiss();
        }}
        disabled={disabled || totalCount === 0}
        busy={isClearingAll}
      />
    </div>
  );
});

export default TodoUtilities;

function UtilityButton({ icon, label, description, onClick, disabled, busy }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      className={`flex h-full flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-colors ${
        disabled
          ? 'cursor-not-allowed border-gray-700 bg-gray-900 text-gray-500 opacity-50'
          : 'border-red-700 bg-gray-900 text-red-200 hover:border-red-500'
      } ${busy ? 'cursor-wait' : ''}`}
      disabled={disabled}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Icon name={icon} />
        {label}
      </span>
      <span className="text-xs text-red-200/80">{description}</span>
    </button>
  );
}

function SummaryCard({ total, pending, completed }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/80 p-3 text-sm text-gray-200">
      <p className="mb-1 flex items-center gap-2 text-gray-100">
        <Icon name="info" className="h-3.5 w-3.5" /> Summary
      </p>
      <p>Total tasks: {total}</p>
      <p>Pending: {pending}</p>
      <p>Completed: {completed}</p>
    </div>
  );
}

UtilityButton.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  busy: PropTypes.bool,
};

UtilityButton.defaultProps = {
  disabled: false,
  busy: false,
};

SummaryCard.propTypes = {
  total: PropTypes.number.isRequired,
  pending: PropTypes.number.isRequired,
  completed: PropTypes.number.isRequired,
};

TodoUtilities.propTypes = {
  visible: PropTypes.bool.isRequired,
  totalCount: PropTypes.number.isRequired,
  completedCount: PropTypes.number.isRequired,
  onConfirmRequest: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
  disabled: PropTypes.bool,
  busyAction: PropTypes.string,
};

TodoUtilities.defaultProps = {
  onDismiss: undefined,
  disabled: false,
  busyAction: null,
};
