export const getUniqueAggregatesAndFacets = (rawData) => {
  return rawData.reduce(
    (acc, curr) => {
      curr?.metadata?.groups.forEach((group) => {
        if (group.type === 'function') {
          acc.uniqueAggregates.add(group.displayName);
        }
        if (group.type === 'facet') {
          acc.uniqueFacets.add(group.displayName);
        }
      });
      return acc;
    },
    { uniqueAggregates: new Set(), uniqueFacets: new Set() }
  );
};

