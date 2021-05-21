import React from 'react';
import PropTypes from 'prop-types';
import {
  VictoryBar,
  VictoryChart,
  VictoryContainer,
  VictoryStack,
  VictoryAxis,
  VictoryTooltip,
} from 'victory';
import ErrorState from '../../src/error-state';
import Legend from '../../src/legend';
import NrqlQueryError from '../../src/nrql-query-error';

import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  AutoSizer,
} from 'nr1';
import theme from '../../src/theme';
import { formatTicks, typeToUnit } from '../../src/utils/units';

const validateNRQLInput = (data) => {
  const { groups } = data[0].metadata;

  const numOfAggregates = groups.filter(
    ({ type }) => type === 'function'
  ).length;
  const numOfFacets = groups.filter(({ type }) => type === 'facet').length;

  if (numOfAggregates === 1 && numOfFacets > 0) {
    return true;
  }

  return false;
};

/**
 * Returns the number of bars that will be shown in the stacked bar chart
 * with a stack of "bar segments" being one "bar".
 *
 * @param {{x: string, y: number, color: string, segmentLabel: string}[][]} data
 * @returns number
 */
const getBarCount = (data) => {
  return data.reduce((acc, series) => {
    // x on barSegment is the bar label which acts as a unique key added to the Set
    series.forEach((barSegment) => acc.add(barSegment.x));
    return acc;
  }, new Set()).size;
};

export default class MultiFacetBarChartVisualization extends React.Component {
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
          acc.barLabel = acc.barLabel ? `${acc.barLabel}, ${value}` : value;
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
   * @param {{data: {y}[], metadata: { color: string, groups: {type: string, value: string}[]} }[]} rawData
   * @returns {{x: string, y: number, color: string, segmentLabel: string}[][]}
   */
  transformData = (rawData) => {
    const colorsBySegmentLabel = new Map();

    // Gather values for each bar data series.
    const facetBreakdown = rawData.reduce((acc, curr) => {
      const { metadata, data } = curr;
      const { barLabel, segmentLabel } = this.getFacetLabels(metadata?.groups);

      if (!colorsBySegmentLabel.has(segmentLabel)) {
        colorsBySegmentLabel.set(segmentLabel, metadata?.color);
      }

      if (acc[segmentLabel]) {
        acc[segmentLabel][barLabel] = data[0].y;
      } else {
        acc[segmentLabel] = {
          [barLabel]: data[0].y,
        };
      }

      return acc;
    }, {});

    // get the units for the measurement
    const unitType = rawData[0].metadata.units_data.y;

    // Convert tiered object into an array of arrays for easy use in the stacked
    // VictoryBar components.
    return Object.entries(facetBreakdown).map(([segmentLabel, entry]) => {
      return Object.entries(entry).map(([barLabel, value]) => ({
        label: [
          `${segmentLabel}`,
          `${value?.toLocaleString() ?? ''}${typeToUnit(unitType)}`,
        ],
        segmentLabel,
        x: barLabel,
        y: value,
        color: colorsBySegmentLabel.get(segmentLabel),
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
      <AutoSizer className="MultiFacetBarChartVisualization">
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
                  <NrqlQueryError
                    title="Unsupported NRQL query"
                    description="The provided NRQL query is not supported by this visualization. Please make sure to have 1 aggregate function and 1-2 facets."
                  />
                );
              }

              const transformedData = this.transformData(data);

              // get the unit value for first data point
              const unitType = data[0].metadata.units_data.y;

              const legendItems = transformedData.reduce((acc, curr) => {
                curr.forEach(({ color, segmentLabel }) => {
                  if (!acc.some(({ label }) => label === segmentLabel)) {
                    acc.push({ label: segmentLabel, color });
                  }
                });
                return acc;
              }, []);

              const chartLeftPadding = 100;
              const chartRightPadding = 25;
              const legendHeight = 50;
              const spaceBelowLegend = 16;

              const barCount = getBarCount(transformedData);
              const xDomainWidth = width - chartLeftPadding - chartRightPadding;
              // set the width of stacked bars so that they take up about 60% of the width
              const barWidth = (xDomainWidth * 0.6) / barCount;

              return (
                <>
                  <VictoryChart
                    containerComponent={<VictoryContainer responsive={false} />}
                    width={width}
                    height={height - legendHeight - spaceBelowLegend}
                    padding={{
                      top: 16,
                      bottom: 40,
                      left: chartLeftPadding,
                      right: chartRightPadding,
                    }}
                    domainPadding={{
                      x: barWidth / 2,
                    }}
                    theme={theme}
                  >
                    <VictoryAxis
                      style={{
                        grid: {
                          stroke: 'none',
                        },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      tickCount={12}
                      tickFormat={(tick) => formatTicks({ unitType, tick })}
                    />
                    <VictoryStack>
                      {transformedData.map((series) => (
                        <VictoryBar
                          key={series.segmentLabel}
                          barWidth={barWidth}
                          labelComponent={
                            <VictoryTooltip
                              horizontal
                              dy={({ datum, scale }) =>
                                scale.y(Math.abs(datum._y1 - datum._y0) / 2) -
                                scale.y(datum._y)
                              }
                              dx={barWidth / 2}
                              constrainToVisibleArea
                              pointerLength={8}
                              flyoutStyle={{
                                stroke: ({ datum }) => datum.color,
                                strokeWidth: 2,
                                filter: 'none',
                              }}
                            />
                          }
                          data={series}
                          style={{
                            data: {
                              fill: ({ datum }) => datum.color,
                            },
                          }}
                        />
                      ))}
                    </VictoryStack>
                  </VictoryChart>
                  <Legend
                    style={{
                      height: legendHeight,
                      marginLeft: chartLeftPadding,
                      marginRight: chartRightPadding,
                    }}
                    items={legendItems}
                  />
                </>
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
