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
import {
  VictoryChart,
  VictoryTheme,
  VictoryBar,
  VictoryTooltip,
} from 'victory';

import ErrorState from '../../src/error-state';
import NrqlQueryError from '../../src/nrql-query-error';

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
  };

  /**
   * Builds up a unique identifier with the facet atrribute values from the FACET clause in NRQL
   *
   * @param {{type: string, value: string}[]} groups
   * @return {string}
   */
  getFacetGroupName = (groups) => {
    return groups.reduce((stringAcc, { type, value }) => {
      if (type === 'facet') {
        stringAcc = stringAcc === '' ? value : `${stringAcc}, ${value}`;
      }
      return stringAcc;
    }, '');
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
    const facetGroupData = rawData.reduce((acc, { data, metadata }) => {
      const facetGroupName = this.getFacetGroupName(metadata?.groups);
      const dataValue = data?.[0]?.y;

      acc[facetGroupName]
        ? (acc[facetGroupName] = {
            ...acc[facetGroupName],
            y: dataValue,
            x: facetGroupName,
            label: `${facetGroupName} ${acc[facetGroupName].y0} - ${dataValue}`,
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

  validateNRQLInput = (data) => {
    const setOfAggregators = data.reduce((acc, curr) => {
      curr?.metadata?.groups.forEach((group) => {
        if (group?.type === 'function') {
          acc.add(group?.displayName);
        }
      });
      return acc;
    }, new Set());

    const numOfAggregates = setOfAggregators.size;

    return numOfAggregates === 2;
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

              const isInputValid = this.validateNRQLInput(data);

              if (!isInputValid) {
                return (
                  <NrqlQueryError
                    title="Unsupported NRQL query"
                    description="The provided NRQL query is not supported by this visualization. Please make sure to have 2 aggregate functions and 1 facet."
                  />
                );
              }

              try {
                const rangeData = this.transformData(data);
                const barCount = rangeData.length;
                const barWidth = (width * 0.6) / barCount;
                return (
                  <VictoryChart
                    domainPadding={{
                      x: barWidth / 2,
                    }}
                    theme={VictoryTheme.material}
                    height={height}
                    width={width}
                  >
                    <VictoryBar
                      barWidth={barWidth}
                      labelComponent={<VictoryTooltip />}
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
