import React from 'react';
import PropTypes from 'prop-types';
import { VictoryChart, VictoryStack, VictoryBar } from 'victory';
import ErrorState from '../../common/error-state';

import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  AutoSizer,
} from 'nr1';

const validateNRQLInput = (data) => {
  const { groups } = data[0].metadata;

  const numOfAggregates = groups.filter(({ type }) => type === 'function')
    .length;
  const numOfFacets = groups.filter(({ type }) => type === 'facet').length;

  if (numOfAggregates === 1 && numOfFacets > 0) {
    return true;
  }

  return false;
};

const getNumBuckets = (data) => {
  return data.reduce((acc, curr) => {
    curr.forEach((group) => acc.add(group.x));
    return acc;
  }, new Set()).size;
};

export default class VictoryBarChartVisualization extends React.Component {
  // Custom props you wish to be configurable in the UI must also be defined in
  // the nr1.json file for the visualization. See docs for more details.
  static propTypes = {
    /**
     * An array of objects consisting of a nrql `query` and `accountId`.
     * This should be a standard prop for any NRQL based visualizations.
     */
    nrqlQueries: PropTypes.arrayOf(
      PropTypes.shape({
        accountId: PropTypes.number,
        query: PropTypes.string,
      })
    ),
  };

  /**
   * Get the bar segment label and its corresponding bar label using the `value`
   * property of entries in `metadata.groups` where `type` === "facet".
   *
   * The returned `segmentLabel` comes from the value of the last FACET clause
   * attribute. The returned `barLabel` is a comma separated string of all but
   * the last FACET clause attribute.
   *
   * @param {{type: string, value: string}[]} groups
   * @returns {{barLabel: string, segmentLabel: string}}
   */
  getFacetLabels = (groups) => {
    const facetEntries = groups?.filter(({ type }) => type === 'facet');
    return facetEntries.reduce(
      (acc, { value }, index) => {
        if (index === facetEntries?.length - 1) {
          acc.segmentLabel = value;
        } else {
          acc.barLabel = Boolean(acc.barLabel)
            ? `${acc.barLabel}, ${value}`
            : value;
        }
        return acc;
      },
      { barLabel: undefined, segmentLabel: undefined }
    );
  };

  /**
   * Transforms NrqlQuery output to a form easy to pass to a set of VictoryBar
   * components.
   *
   * Uses `metdata.color` for the bar fill colors.
   *
   * Builds labels for bars and bar segements using the `value` property on
   * `metadata.groups` entries where `type` === "facet".
   *
   * Uses the `y` property on the data array entry for y axis values.
   *
   * @param {{data: {y}[], metadata: { color: String, groups: {type: string, value: string}[]} }[]} rawData
   * @returns {{x: string, y: number, segmentLabel: string}[][]}
   */
  transformData = (rawData) => {
    // Gather values for each bar data series.
    const facetBreakdown = rawData.reduce((acc, curr) => {
      const { metadata, data } = curr;
      const { barLabel, segmentLabel } = this.getFacetLabels(metadata?.groups);

      if (acc[segmentLabel]) {
        acc[segmentLabel][barLabel] = data[0].y;
      } else {
        acc[segmentLabel] = { [barLabel]: data[0].y };
      }

      return acc;
    }, {});

    // Convert tiered object into an array of arrays for easy use in the stacked
    // VictoryBar components.
    return Object.entries(facetBreakdown).map(([segmentLabel, entry]) => {
      return Object.entries(entry).map(([barLabel, value]) => ({
        segmentLabel,
        x: barLabel,
        y: value,
      }));
    });
  };

  render() {
    const { nrqlQueries } = this.props;

    const nrqlQueryPropsAvailable =
      nrqlQueries &&
      nrqlQueries[0] &&
      nrqlQueries[0].accountId &&
      nrqlQueries[0].query;

    if (!nrqlQueryPropsAvailable) {
      return <EmptyState />;
    }

    return (
      <AutoSizer>
        {({ width, height }) => (
          <NrqlQuery
            query={nrqlQueries[0].query}
            accountId={parseInt(nrqlQueries[0].accountId)}
            pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
          >
            {({ data, loading, error }) => {
              if (loading) {
                return <Spinner />;
              }

              if (error) {
                return <ErrorState />;
              }

              const isInputValid = validateNRQLInput(data);

              if (!isInputValid) {
                return (
                  <ErrorState>
                    NRQL Query is not valid. Please make sure to have 1
                    aggregate function and 1-2 facets.
                  </ErrorState>
                );
              }

              const transformedData = this.transformData(data);
              const numBarStacks = getNumBuckets(transformedData);

              const chartLeftPadding = 100;
              const chartRightPadding = 25;

              const domainWidth = width - chartLeftPadding - chartRightPadding;
              const barAndPaddingWidth = domainWidth / numBarStacks;

              return (
                <VictoryChart
                  width={width}
                  height={height}
                  padding={{
                    top: 20,
                    bottom: 40,
                    left: chartLeftPadding,
                    right: chartRightPadding,
                  }}
                  domainPadding={{
                    x: barAndPaddingWidth / 2,
                  }}
                >
                  <VictoryStack colorScale={'qualitative'}>
                    {transformedData.map((series) => (
                      <VictoryBar data={series} />
                    ))}
                  </VictoryStack>
                </VictoryChart>
              );
            }}
          </NrqlQuery>
        )}
      </AutoSizer>
    );
  }
}

const EmptyState = () => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Please provide a NRQL query & account ID pair
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
        type={HeadingText.TYPE.HEADING_4}
      >
        An example NRQL query you can try is:
      </HeadingText>
      <code>
        FROM Transaction SELECT average(duration) FACET environment, appName
      </code>
      <HeadingText>
        where the color will be mapped to the last facet entry. In this case,
        our last facet appName, will be denoted by different colors.
      </HeadingText>
    </CardBody>
  </Card>
);
