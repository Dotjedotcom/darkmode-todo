export function priorityLabel(priority) {
  switch (priority) {
    case 'low':
      return '🧘 Chill';
    case 'normal':
      return '⚖️ Steady';
    case 'high':
      return '🔥 Hot';
    default:
      return priority || 'Steady';
  }
}

export function priorityGlyph(priority) {
  switch (priority) {
    case 'low':
      return '🧘';
    case 'high':
      return '🔥';
    case 'normal':
    default:
      return '⚖️';
  }
}
