export const FAB_QUICK_TYPES = ['multiple', 'true-false', 'short-answer', 'section'];

export function getFabQuickTypeMeta(typeId, questionTypes) {
  if (!Array.isArray(questionTypes)) return null;
  const meta = questionTypes.find((t) => t?.id === typeId);
  if (!meta) return { id: typeId, icon: null, label: '' };
  return {
    id: meta.id,
    icon: meta.icon ?? null,
    label: meta.label ?? '',
  };
}
