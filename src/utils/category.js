export const DEFAULT_CATEGORIES = [
  'business',
  'computers',
  'chores',
  'errands',
  'gaming',
  'groceries',
  'music',
  'coding',
  'shopping',
  'travel',
  'network',
  'appointments',
];

export function categoryPillClass(category) {
  const name = (category || '').toLowerCase();
  switch (name) {
    case 'errands':
      return 'bg-blue-900/40 border-blue-700 text-blue-300';
    case 'groceries':
      return 'bg-green-900/40 border-green-700 text-green-300';
    case 'shopping':
      return 'bg-pink-900/40 border-pink-700 text-pink-300';
    case 'gaming':
      return 'bg-indigo-900/40 border-indigo-700 text-indigo-300';
    case 'computers':
      return 'bg-cyan-900/40 border-cyan-700 text-cyan-300';
    case 'coding':
      return 'bg-violet-900/40 border-violet-700 text-violet-300';
    case 'music':
      return 'bg-rose-900/40 border-rose-700 text-rose-300';
    case 'travel':
      return 'bg-teal-900/40 border-teal-600 text-teal-200';
    case 'network':
      return 'bg-blue-900/40 border-blue-600 text-blue-200';
    case 'appointments':
      return 'bg-amber-900/40 border-amber-600 text-amber-200';
    default:
      return 'bg-gray-700 border-gray-600';
  }
}

export function categoryIcon(category) {
  const name = (category || '').toLowerCase();
  switch (name) {
    case 'business':
      return '💼';
    case 'computers':
      return '🖥️';
    case 'chores':
      return '🧹';
    case 'errands':
      return '🚗';
    case 'gaming':
      return '🎮';
    case 'groceries':
      return '🛒';
    case 'music':
      return '🎵';
    case 'coding':
      return '💻';
    case 'shopping':
      return '🛍️';
    case 'travel':
      return '✈️';
    case 'network':
      return '🤝';
    case 'appointments':
      return '📆';
    default:
      return '🏷️';
  }
}
