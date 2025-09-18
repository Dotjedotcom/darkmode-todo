import PropTypes from 'prop-types';
import { categoryIcon } from '../../../utils/category.js';

const ALL_KEY = '';

export default function CategoryFilterRow({
  categories,
  activeCategory,
  onSelectCategory,
  disabled,
}) {
  const uniqueCategories = Array.from(
    new Set(categories.map((name) => (name || '').trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const handleClick = (value) => {
    if (disabled) return;
    if (value === activeCategory) {
      onSelectCategory(ALL_KEY);
    } else {
      onSelectCategory(value);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/70 px-3 py-3">
      <Chip
        label="All"
        glyph="∞"
        active={activeCategory === ALL_KEY}
        onClick={() => handleClick(ALL_KEY)}
        disabled={disabled}
      />
      {uniqueCategories.map((category) => (
        <Chip
          key={category}
          label={category}
          glyph={categoryIcon(category)}
          active={activeCategory === category}
          onClick={() => handleClick(category)}
          disabled={disabled}
        />
      ))}
      {uniqueCategories.length === 0 && (
        <span className="text-xs text-gray-500">No categories yet.</span>
      )}
    </div>
  );
}

function Chip({ label, glyph, active, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? 'border-blue-500 bg-blue-900/40 text-blue-100'
          : 'border-gray-700 bg-gray-800 text-gray-200 hover:border-gray-500'
      } disabled:cursor-not-allowed disabled:opacity-50`}
      aria-pressed={active}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {glyph}
      </span>
      <span className="text-xs uppercase tracking-wide">{label}</span>
    </button>
  );
}

CategoryFilterRow.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeCategory: PropTypes.string.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

CategoryFilterRow.defaultProps = {
  disabled: false,
};

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  glyph: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Chip.defaultProps = {
  active: false,
  disabled: false,
};
