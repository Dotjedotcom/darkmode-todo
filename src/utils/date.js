export function parseDateLocal(value) {
  if (!value || typeof value !== 'string') return null;
  const [yStr, mStr, dStr] = value.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  if ([y, m, d].some((n) => Number.isNaN(n))) return null;
  const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  return dt.getTime();
}

export function toLocalDateInput(ms) {
  if (ms == null) return '';
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  return `${yyyy}-${MM}-${DD}`;
}

export function defaultDateLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toLocalDateInput(d.getTime());
}
