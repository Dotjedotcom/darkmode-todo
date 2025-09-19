import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon.jsx';

export default function HeaderBar({
  remainingCount,
  totalCount,
  completedCount,
  onShare,
  onExportJson,
  onExportCsv,
  onTriggerImport,
  replaceOnImport,
  onReplaceOnImportChange,
  onShowInfo,
  canInstall = false,
  onInstallApp = () => {},
  updateAvailable = false,
  onUpdateApp = () => {},
}) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const shareMenuRef = useRef(null);
  const helpMenuRef = useRef(null);
  const summaryMenuRef = useRef(null);
  const summaryButtonRef = useRef(null);

  useEffect(() => {
    if (!showShareMenu) return;
    const onClick = (event) => {
      if (!shareMenuRef.current) return;
      if (!shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setShowShareMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showShareMenu]);

  useEffect(() => {
    if (!showHelpMenu) return;
    const onClick = (event) => {
      if (!helpMenuRef.current) return;
      if (!helpMenuRef.current.contains(event.target)) {
        setShowHelpMenu(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setShowHelpMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showHelpMenu]);

  useEffect(() => {
    if (!showSummary) return;
    const onClick = (event) => {
      if (
        summaryMenuRef.current &&
        (summaryMenuRef.current.contains(event.target) ||
          summaryButtonRef.current?.contains(event.target))
      )
        return;
      setShowSummary(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setShowSummary(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showSummary]);

  return (
    <div id="menu" className="w-full max-w-3xl flex items-center justify-between mb-3 to-gray-100">
      <div className="relative flex items-center gap-2 text-sm text-gray-400">
        <span>{remainingCount} remaining</span>
        <button
          type="button"
          ref={summaryButtonRef}
          onClick={() => setShowSummary((value) => !value)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition-colors hover:border-gray-500 hover:text-gray-100"
          title="Show summary"
        >
          <Icon name="info" className="h-3.5 w-3.5" />
          <span className="sr-only">Show summary</span>
        </button>
        {showSummary && (
          <div
            ref={summaryMenuRef}
            className="absolute left-0 top-full z-40 mt-2 w-48 rounded-lg border border-gray-700 bg-gray-900 p-3 text-xs text-gray-200 shadow-xl"
          >
            <p className="mb-1 flex items-center gap-2 text-sm text-gray-100">
              <Icon name="list" className="h-3.5 w-3.5" /> Summary
            </p>
            <div className="space-y-1">
              <p>Total: {totalCount}</p>
              <p>Pending: {remainingCount}</p>
              <p>Completed: {completedCount}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {updateAvailable && (
          <button
            onClick={onUpdateApp}
            className="px-3 py-1 rounded bg-blue-900 border border-blue-600 flex items-center gap-2 text-sm text-blue-100 hover:border-blue-400"
            title="Reload to update"
            type="button"
          >
            <Icon name="info" className="h-3.5 w-3.5" />
            Update ready
          </button>
        )}
        {canInstall && (
          <button
            onClick={onInstallApp}
            className="px-3 py-1 rounded bg-blue-600 border border-blue-500 flex items-center gap-2 text-sm text-white hover:bg-blue-500"
            title="Install app"
            type="button"
          >
            <Icon name="download" className="h-3.5 w-3.5" />
            Install
          </button>
        )}
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu((value) => !value)}
            className="px-3 py-1 rounded bg-gray-800 border border-gray-700 flex items-center gap-2"
            title="Share / Import / Export"
          >
            <Icon name="share" />
            Share
          </button>
          {showShareMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-700 bg-gray-900 shadow-lg z-10">
              <div className="py-1 text-sm">
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    onShare();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Icon name="share" /> Share
                </button>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    onExportJson();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Icon name="download" /> Export JSON
                </button>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    onExportCsv();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Icon name="csv" /> Export CSV
                </button>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    onTriggerImport();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Icon name="upload" /> Import JSON
                </button>
                <label className="flex items-center gap-2 px-3 py-2 border-t border-gray-800 text-xs text-gray-300 select-none">
                  <input
                    type="checkbox"
                    className="accent-gray-500"
                    checked={replaceOnImport}
                    onChange={(event) => onReplaceOnImportChange(event.target.checked)}
                  />
                  replace on import
                </label>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={helpMenuRef}>
          <button
            onClick={() => setShowHelpMenu((value) => !value)}
            className="px-3 py-1 rounded bg-gray-800 border border-gray-700 flex items-center gap-2"
          >
            <Icon name="info" /> Info
          </button>
          {showHelpMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-700 bg-gray-900 shadow-lg z-10">
              <div className="py-1 text-sm">
                <button
                  onClick={() => {
                    setShowHelpMenu(false);
                    onShowInfo('help');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Icon name="question" /> App hulp
                </button>
                <button
                  onClick={() => {
                    setShowHelpMenu(false);
                    onShowInfo('about');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Icon name="user" /> About
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

HeaderBar.propTypes = {
  remainingCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  completedCount: PropTypes.number.isRequired,
  onShare: PropTypes.func.isRequired,
  onExportJson: PropTypes.func.isRequired,
  onExportCsv: PropTypes.func.isRequired,
  onTriggerImport: PropTypes.func.isRequired,
  replaceOnImport: PropTypes.bool.isRequired,
  onReplaceOnImportChange: PropTypes.func.isRequired,
  onShowInfo: PropTypes.func.isRequired,
  canInstall: PropTypes.bool,
  onInstallApp: PropTypes.func,
  updateAvailable: PropTypes.bool,
  onUpdateApp: PropTypes.func,
};
