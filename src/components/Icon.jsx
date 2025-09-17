import PropTypes from 'prop-types';

const ICONS = {
  share: (
    <>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5-5 5 5" />
      <path d="M12 5v12" />
    </>
  ),
  csv: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10" />
      <path d="M7 12h10" />
      <path d="M7 16h6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  toggle: (
    <>
      <rect x="2" y="7" width="20" height="10" rx="5" />
      <circle cx="9" cy="12" r="3" />
    </>
  ),
  broom: (
    <>
      <path d="M3 21l6-6" />
      <path d="M15 3l6 6" />
      <path d="M9 15l6-6" />
      <path d="M7 17l-2 4 4-2" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2L19 6" />
    </>
  ),
  question: (
    <>
      <path d="M9 9a3 3 0 1 1 6 0c0 3-3 3-3 6" />
      <path d="M12 17h.01" />
      <circle cx="12" cy="12" r="10" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8h.01" />
      <path d="M11 12h2v6h-2z" />
    </>
  ),
  tag: (
    <>
      <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  flag: (
    <>
      <path d="M4 4v16" />
      <path d="M4 4h10l-2 4 2 4H4" />
    </>
  ),
  tune: (
    <>
      <path d="M3 6h10" />
      <path d="M19 6h2" />
      <circle cx="15" cy="6" r="2" />
      <path d="M3 12h2" />
      <path d="M9 12h12" />
      <circle cx="7" cy="12" r="2" />
      <path d="M3 18h14" />
      <path d="M21 18h0" />
      <circle cx="19" cy="18" r="2" />
    </>
  ),
  sliders: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  list: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>
  ),
  circle: (
    <>
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  check: (
    <>
      <path d="M20 6L9 17l-5-5" />
    </>
  ),
  checkmark: (
    <>
      <path d="M20 6L9 17l-5-5" />
      <path d="M4 12l3 3" />
    </>
  ),
  x: (
    <>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </>
  ),
  'chevron-down': (
    <>
      <path d="M6 9l6 6 6-6" />
    </>
  ),
  'chevron-up': (
    <>
      <path d="M18 15l-6-6-6 6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  edit: (
    <>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
      <path d="M14.06 4.94l3.75 3.75" />
    </>
  ),
  facepunch: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="15" cy="10" r="1" />
      <circle cx="9" cy="10" r="1" />
      <path d="M9 15c1.5 1 4.5 1 6 0" />
      <path d="M16 14l3-3" />
      <path d="M17 9l2 2" />
    </>
  ),
  gun: (
    <>
      <rect x="3" y="10" width="12" height="4" rx="1" />
      <path d="M15 11h4v2h-4z" />
      <path d="M7 14v3h2" />
      <circle cx="6" cy="12" r="0.7" />
    </>
  ),
  notes: (
    <>
      <path d="M21 15V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a1 1 0 0 0 1.67.74L12 16h7a2 2 0 0 0 2-2z" />
      <line x1="9" y1="7" x2="17" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </>
  ),
};

export default function Icon({ name, className = 'h-4 w-4', ...rest }) {
  const glyph = ICONS[name];
  if (!glyph) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {glyph}
    </svg>
  );
}

Icon.propTypes = {
  name: PropTypes.oneOf(Object.keys(ICONS)).isRequired,
  className: PropTypes.string,
};
