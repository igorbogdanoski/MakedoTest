export function buildToolboxSections(filteredTypes = [], categoryOrder = []) {
  return categoryOrder
    .map((category) => {
      const items = filteredTypes.filter(
        (type) =>
          type.cat === category || (category === 'geometry' && type.subjects.includes('geometry'))
      );

      if (items.length === 0) {
        return null;
      }

      const finalItems =
        category === 'geometry'
          ? items
          : items.filter((type) => !type.subjects.includes('geometry') || category !== 'напредни');

      return {
        category,
        items: finalItems,
      };
    })
    .filter(Boolean);
}
