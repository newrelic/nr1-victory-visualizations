export const getFacetLabel = (groups) => {
  return groups
    .filter(({ type }) => type === 'facet')
    .reduce(
      (acc, { value }) => [...acc, value === undefined ? 'null' : value],
      []
    )
    .join(', ');
};
