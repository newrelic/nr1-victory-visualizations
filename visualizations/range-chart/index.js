import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  AutoSizer,
} from 'nr1';
import { VictoryAxis, VictoryChart, VictoryBar, VictoryTooltip } from 'victory';

import ErrorState from '../../src/error-state';
import NrqlQueryError from '../../src/nrql-query-error';

import theme from '../../src/theme';
import { getUniqueAggregatesAndFacets } from '../../src/utils/nrql-validation-helper';
import truncateLabel from '../../src/utils/truncate-label';
import { getFacetLabel } from '../../src/utils/facets';
import { typeToUnit, formatTicks } from '../../src/utils/units';

export default class RangeChartVisualization extends React.Component {
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
    /**
     * Object with a singular boolean value.
     * Determines if "other" attributes are included in visualization.
     */
    other: PropTypes.shape({
      visible: PropTypes.bool,
    }),
  };

  /**
   * Transforms from NRQL data output to VictoryBar input format.
   *
   * Uses `metdata.color` for the bar fill colors.
   *
   * Uses the `value` property on group where type === facet for the unique entry identifier.
   *
   * Uses the `y` property on the data array entry for the `y` and `y0` values.
   *
   * @param {{data: {y}[], metadata: { color: string, groups: {type: string, value: string}[]} }[]} rawData
   * @returns {{rangeData: {facetGroupName: string, y: number, y0: number, color: string}[], tickValues: string[]}}
   */
  transformData = (rawData) => {
    const {
      other: { visible },
    } = this.props;
    const facetGroupData = rawData.reduce((acc, { data, metadata }) => {
      const facetGroupName = getFacetLabel(metadata?.groups);
      const dataValue = data?.[0]?.y;

      const unitType = metadata.units_data.y;

      if (!visible && facetGroupName === 'Other') {
        return acc;
      }

      acc[facetGroupName]
        ? (acc[facetGroupName] = {
            ...acc[facetGroupName],
            y: dataValue,
            x: facetGroupName,
            label: `${facetGroupName} ${
              acc[facetGroupName].y0
            } - ${dataValue} ${typeToUnit(unitType)}`,
          })
        : (acc[facetGroupName] = {
            color: metadata?.color,
            y0: dataValue,
          });

      return acc;
    }, {});

    return Object.entries(facetGroupData).map(
      ([facetGroupName, facetGroupData]) => ({
        facetGroupName,
        ...facetGroupData,
      })
    );
  };

  nrqlInputIsValid = (data) => {
    const { uniqueAggregates, uniqueFacets } =
      getUniqueAggregatesAndFacets(data);
    return uniqueAggregates.size === 2 && uniqueFacets.size > 0;
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
                return (
                  <NrqlQueryError
                    title="NRQL Syntax Error"
                    description={error.message}
                  />
                );
              }

              if (!this.nrqlInputIsValid(data)) {
                return (
                  <NrqlQueryError
                    title="Unsupported NRQL query"
                    description="The provided NRQL query is not supported by this visualization. Please make sure to have exactly 2 aggregate functions in the SELECT clause and at least one FACET clause."
                  />
                );
              }

              try {
                const rangeData = this.transformData(data);
                const unitType = data[0].metadata.units_data.y;
                const barCount = rangeData.length;
                const barWidth = (width * 0.6) / barCount;

                const yAxisTickCount = Math.round(height / 36);
                const [y0DomainValues, yDomainValues] = rangeData.reduce(
                  (acc, { y0, y }) => {
                    acc[0].push(y0);
                    acc[1].push(y);
                    return acc;
                  },
                  [[], []]
                );
                const tickIncrement =
                  (Math.max(...yDomainValues) - Math.min(...y0DomainValues)) /
                  yAxisTickCount;

                return (
                  <VictoryChart
                    domainPadding={{
                      x: barWidth / 2,
                    }}
                    height={height}
                    width={width}
                    theme={theme}
                    padding={{
                      top: 16,
                      bottom: 40,
                      left: 75,
                      right: 25,
                    }}
                  >
                    <VictoryAxis
                      tickFormat={(label) =>
                        truncateLabel(label, width / barCount)
                      }
                    />
                    <VictoryAxis
                      dependentAxis
                      tickCount={yAxisTickCount}
                      tickFormat={(tick) =>
                        formatTicks({ unitType, tick, tickIncrement })
                      }
                    />
                    <VictoryBar
                      barWidth={barWidth}
                      labelComponent={
                        <VictoryTooltip horizontal constrainToVisibleArea />
                      }
                      style={{
                        data: {
                          fill: ({ datum }) => datum.color,
                        },
                      }}
                      data={rangeData}
                    />
                  </VictoryChart>
                );
              } catch (e) {
                return <ErrorState />;
              }
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
        FROM Transaction SELECT percentile(duration, 50), percentile(duration,
        95) FACET dateOf(timestamp) SINCE 7 days ago
      </code>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
        type={HeadingText.TYPE.HEADING_4}
      >
        The bottom of the range bar is represented by the first aggregate value.
        <br />
        The top of the range bar is represented by the second aggregate value.
      </HeadingText>
    </CardBody>
  </Card>
);
