import React from 'react';
import PropTypes from 'prop-types';

// ErrorBoundary catches unexpected runtime errors and shows a fallback UI.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, detail: '' };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, detail: err?.message || String(err) || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('Caught error in ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-6">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <h1 className="text-xl font-bold mb-2">App Error</h1>
            <p className="text-sm mb-3">
              An unexpected error occurred. This preview environment might not support certain
              browser APIs like IndexedDB.
            </p>
            <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto border border-gray-700">
              {this.state.detail}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

export default ErrorBoundary;
