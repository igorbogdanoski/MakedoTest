// Category filter button styling and label logic
const CATEGORY_BUTTON_ACTIVE_CLASS = 'bg-white text-indigo-600 shadow-sm';
const CATEGORY_BUTTON_INACTIVE_CLASS = 'text-slate-400 hover:text-slate-600';
const CATEGORY_BUTTON_BASE_CLASS =
  'flex-1 px-2 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all';

/**
 * Get category filter button class based on active state
 * @param {boolean} isActive - Whether this category is currently active
 * @returns {string} Full Tailwind class string for the button
 */
export function getCategoryButtonClass(isActive) {
  const activeStyle = isActive ? CATEGORY_BUTTON_ACTIVE_CLASS : CATEGORY_BUTTON_INACTIVE_CLASS;
  return `${CATEGORY_BUTTON_BASE_CLASS} ${activeStyle}`;
}

/**
 * Extract first word from category label
 * @param {string} label - Category label (e.g., "Multiple Choice")
 * @returns {string} First word (e.g., "Multiple")
 */
export function getCategoryButtonLabel(label) {
  return label && typeof label === 'string' ? label.split(' ')[0] : label;
}
