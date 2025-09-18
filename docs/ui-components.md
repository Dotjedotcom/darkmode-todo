# UI Component Contracts

This document summarises the shared props and behaviours for the todo feature components. Each component is designed for reuse in future views (e.g. mobile layout, calendar dashboard) and exposes a consistent contract.

## `<AddTodoForm />`

| Prop                                  | Type                            | Description                                                                                              |
| ------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `onAdd`                               | `(payload) => Promise<boolean>` | Invoked when the user confirms a new todo. Should resolve truthy when creation succeeds.                 |
| `categoryOptions`                     | `string[]`                      | Available category suggestions displayed in the combobox.                                                |
| `showAdvanced` / `onToggleAdvanced`   | `bool` / `() => void`           | Controls the visibility of the advanced inputs panel.                                                    |
| `showUtilities` / `onToggleUtilities` | `bool` / `() => void`           | Lifts state so parents can toggle the utilities tray.                                                    |
| `disabled`                            | `bool`                          | Disables all interactive controls (auto applied while storage is loading or an async action is running). |
| `busyAction`                          | `string`                        | When equal to `'add'` the submit button shows a busy state.                                              |

The form calls `onAdd` with `{ text, category, dueInput, priority }`. Consumers should trim and validate as needed (the default implementation trims and rejects empty titles).

## `<TodoUtilities />`

| Prop                                                                 | Type                                     | Description                                                                  |
| -------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| `visible`                                                            | `bool`                                   | Gate rendering of the toolbar.                                               |
| `search` / `onSearchChange`                                          | `string` / `(value) => void`             | Controlled search box state.                                                 |
| `filterStatus`, `filterCategory`, `sortMode`                         | Controlled values handled by the parent. |
| `onFilterStatusChange`, `onFilterCategoryChange`, `onSortModeChange` | Callback hooks for the above.            |
| `categoryOptions`                                                    | `string[]`                               | Provides dropdown items for category filter.                                 |
| `totalCount`, `completedCount`                                       | `number`                                 | Used to disable destructive actions when there is nothing to operate on.     |
| `onConfirmRequest`                                                   | `(kind) => void`                         | Signals the parent to open the confirmation dialog for a destructive action. |
| `disabled`                                                           | `bool`                                   | Locks the toolbar (set automatically while async actions run).               |
| `busyAction`                                                         | `string`                                 | When set, the relevant button shows a waiting cursor.                        |

## `<TodoList />`

| Prop                                                              | Type                                             | Description                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| `todos`                                                           | `TodoItem[]`                                     | Render payload (same structure as the store).                      |
| `onToggleTodo`, `onRequestDelete`, `onUpdateTodo`, `onDeleteTodo` | Callback hooks triggered from the list controls. |
| `categoryOptions`                                                 | `string[]`                                       | Provides suggestions when editing a todo.                          |
| `disabled`                                                        | `bool`                                           | Disables inline editing and toggles.                               |
| `busyAction`                                                      | `string`                                         | Allows the list to expose `aria-busy` while mutations are pending. |

## `<ConfirmDialog />`

| Prop                             | Type                                     | Description                                                                           |
| -------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- | --------------- | ----------- | ----------- | ----- | -------------------------------------- |
| `open`                           | `bool`                                   | Controls visibility.                                                                  |
| `kind`                           | `'clearAll'                              | 'clearCompleted'                                                                      | 'importReplace' | 'deleteOne' | 'toggleAll' | null` | Chooses the message and confirm label. |
| `completedCount`                 | `number`                                 | Used to disable the "clear completed" confirmation when there are no completed items. |
| `pendingImport`, `pendingDelete` | Payloads used to render contextual text. |
| `onCancel`, `onConfirm`          | Action callbacks.                        |
| `disabled`                       | `bool`                                   | Prevents double submissions while an async action is already underway.                |

Each dialog and form is kept framework-agnostic (plain props, no hook dependencies) so they can be rendered in Storybook or tested in isolation.

## Async UX Guidelines

- Use `runAction(kind, message, fn)` from `TodoApp` when wiring new async behaviours. It centralises busy-state handling and error messaging.
- Toggle `disabled` on the shared components whenever you need to prevent concurrent operations. The components already handle this prop.
- Expose new store actions via `useTodoStore` and accompany them with JSDoc typings and tests. The store offers helper hooks: `useTodos`, `usePendingCount`, and `useStorageReady`.

Refer to the existing usage in `TodoApp.jsx` for examples of the recommended patterns.
