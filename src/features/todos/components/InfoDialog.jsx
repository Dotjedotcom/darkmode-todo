import PropTypes from 'prop-types';

export default function InfoDialog({ kind, onClose }) {
  if (!kind) return null;

  const isHelp = kind === 'help';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-3">{isHelp ? 'Help' : 'About'}</h2>
        {isHelp ? (
          <div className="space-y-3 text-sm text-gray-200">
            <p>
              This app is a simple, installable PWA to track tasks with categories, dates and priorities.
              It works offline and stores data in IndexedDB with graceful fallbacks.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Add tasks; use More options for Category, Date and Priority.</li>
              <li>Filter by status, search by text, and sort by due, created, or priority.</li>
              <li>Click the tag/calendar/flag icons in edit mode to change details.</li>
              <li>Share or export/import the list from the Share menu.</li>
              <li>Dropdowns are keyboard-friendly: Arrow keys, Enter, Tab, Escape.</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-gray-200">
            <p>Built by you, with a little help from an AI coding partner.</p>
            <p>
              Co-author’s note: thanks for the great collaboration — your ideas shaped a clean, accessible,
              and delightful todo app.
            </p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-700 border border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

InfoDialog.propTypes = {
  kind: PropTypes.oneOf(['help', 'about', null]),
  onClose: PropTypes.func.isRequired,
};

InfoDialog.defaultProps = {
  kind: null,
};
