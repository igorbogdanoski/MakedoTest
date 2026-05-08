export function getSectionGridClass(layout) {
  const baseClass = 'grid gap-x-12 gap-y-20';

  if (layout === 'double') {
    return `${baseClass} grid-cols-2 mt-20`;
  }

  return `${baseClass} grid-cols-1 mt-20`;
}

export function getSectionItemSpanClass(layout, fullWidth) {
  if (layout === 'double' && fullWidth) {
    return 'col-span-2';
  }

  return '';
}
