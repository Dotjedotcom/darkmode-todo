import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import TodoApp from '@/features/todos/TodoApp.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <TodoApp />
    </ErrorBoundary>
  );
}
