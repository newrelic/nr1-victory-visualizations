export const getUniqueAggregatesFacetsAttributes = (rawData) => {
  const aggregatesAndFacets = rawData
    .flatMap(({ metadata }) => metadata.groups)
    .reduce(
      (acc, group) => {
        if (group.type === 'function' && group.value !== 'series') {
          acc.uniqueAggregates.add(group.displayName);
        }
        if (group.type === 'facet') {
          acc.uniqueFacets.add(group.displayName);
        }

        return acc;
      },
      { uniqueAggregates: new Set(), uniqueFacets: new Set() }
    );

  const injectedKeys = ['begin_time', 'end_time', 'x', 'y', 'timestamp'];
  const nonInjectedKeys = Object.keys(rawData[0].metadata.units_data).filter(
    (key) => !injectedKeys.includes(key)
  );
  const aggregateValues = rawData[0].metadata.groups.map(({ value }) => value);
  const nonAggregateValues = nonInjectedKeys.filter((key) => {
    return !aggregateValues.includes(key);
  });

  return {
    ...aggregatesAndFacets,
    uniqueNonAggregates: new Set(nonAggregateValues),
  };
};
