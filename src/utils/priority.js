export const PRIORITY_SCALE = ['veryLow', 'low', 'medium', 'high', 'urgent'];

export function normalizePriority(priority) {
  if (!priority) return 'medium';
  if (PRIORITY_SCALE.includes(priority)) return priority;
  switch (priority) {
    case 'low':
      return 'low';
    case 'normal':
      return 'medium';
    case 'high':
      return 'high';
    default:
      return 'medium';
  }
}

export function priorityLabel(priority) {
  switch (normalizePriority(priority)) {
    case 'veryLow':
      return 'Very Low';
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'urgent':
      return 'Urgent';
    default:
      return 'Medium';
  }
}

export function priorityGlyph(priority) {
  switch (normalizePriority(priority)) {
    case 'veryLow':
      return '🌱';
    case 'low':
      return '🧘';
    case 'medium':
      return '⚖️';
    case 'high':
      return '🔥';
    case 'urgent':
      return '🚨';
    default:
      return '⚖️';
  }
}
