import PropTypes from 'prop-types';

export default function ConfirmDialog({
  open,
  kind,
  completedCount,
  pendingImport,
  pendingDelete,
  onCancel,
  onConfirm,
  disabled = false,
}) {
  if (!open) return null;

  let message = 'Are you sure?';
  switch (kind) {
    case 'clearAll':
      message = 'Clear all todos? This cannot be undone.';
      break;
    case 'clearCompleted':
      message = `Clear ${completedCount} completed item(s)?`;
      break;
    case 'importReplace':
      if (Array.isArray(pendingImport)) {
        message = `Replace current list with ${pendingImport.length} imported item(s)? This cannot be undone.`;
      }
      break;
    case 'deleteOne':
      if (pendingDelete) {
        message = `Delete "${pendingDelete.text}"? This cannot be undone.`;
      }
      break;
    case 'toggleAll':
      message = 'Toggle all todos?';
      break;
    default:
      break;
  }

  let confirmLabel = 'Confirm';
  switch (kind) {
    case 'clearAll':
      confirmLabel = 'Yes, clear';
      break;
    case 'clearCompleted':
      confirmLabel = 'Yes, clear';
      break;
    case 'importReplace':
      confirmLabel = 'Yes, replace';
      break;
    case 'deleteOne':
      confirmLabel = 'Yes, delete';
      break;
    case 'toggleAll':
      confirmLabel = 'Yes, toggle';
      break;
    default:
      confirmLabel = 'Confirm';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Confirm</h2>
        <p className="text-sm text-gray-300 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded bg-gray-700 border border-gray-600">
            Cancel
          </button>
          <button
            onClick={disabled ? undefined : onConfirm}
            className="px-3 py-1 rounded bg-red-600 border border-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={disabled || (kind === 'clearCompleted' && completedCount === 0)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  kind: PropTypes.string,
  completedCount: PropTypes.number.isRequired,
  pendingImport: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
    }),
  ),
  pendingDelete: PropTypes.shape({
    id: PropTypes.number,
    text: PropTypes.string,
  }),
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ConfirmDialog.defaultProps = {
  kind: null,
  pendingImport: null,
  pendingDelete: null,
  disabled: false,
};
