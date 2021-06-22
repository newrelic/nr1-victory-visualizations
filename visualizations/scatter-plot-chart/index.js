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
import { VictoryChart, VictoryScatter, VictoryTheme } from 'victory';
import NrqlQueryError from '../../src/nrql-query-error/nrql-query-error';
import {
  getUniqueAggregatesAndFacets,
  getUniqueNonAggregates,
} from '../../src/utils/nrql-validation-helper';
import NoDataState from '../../src/no-data-state';
import { getFacetLabel } from '../../src/utils/facets';

export default class ScatterPlotChartVisualization extends React.Component {
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

  getAggregatesData = (rawData, facets) => {
    console.log('raw data: ', rawData, 'facets', facets);
    const facetGroupData = rawData.reduce((acc, { data, metadata }) => {
      const facetGroupName = getFacetLabel(metadata?.groups);
      const dataValue = data?.[0]?.y;

      const unitType = metadata.units_data.y;

      acc[facetGroupName] ? acc[facetGroupName].y ? acc[facetGroupName] = {
        ...acc[facetGroupName],
        size: dataValue * 10
      } : (acc[facetGroupName] = {
            ...acc[facetGroupName],
            y: dataValue,
          })
        : (acc[facetGroupName] = {
            color: metadata?.color,
            x: dataValue,
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

  getNonAggregatesData = (data, color) => {
    const { uniqueNonAggregates } = getUniqueNonAggregates(data);
    const nonAggregates = {};

    Array.from(uniqueNonAggregates).map((datapoint, i) => {
      return (nonAggregates[i] = datapoint);
    });

    const series = data[0].data.map((point) => {
      return {
        x: point[nonAggregates[0]],
        y: point[nonAggregates[1]],
        color,
      };
    });
    return series;
  };

  transformData = (data) => {
    const { uniqueAggregates, uniqueFacets } =
      getUniqueAggregatesAndFacets(data);
    const { uniqueNonAggregates } = getUniqueNonAggregates(data);
    let series;
    const color = uniqueFacets.values().next()
      ? uniqueFacets.values().next()
      : data[0].metadata.color;

    if (uniqueNonAggregates.size > 1) {
      console.log('got to uniqueNonAggregates');
      series = this.getNonAggregatesData(data, color);
    } else if (uniqueAggregates.size > 1) {
      console.log('got to uniqueAggregates');
      series = this.getAggregatesData(data, uniqueFacets, uniqueAggregates);
    }

    return { series };
  };

  nrqlInputIsValid = (data) => {
    const { uniqueAggregates } = getUniqueAggregatesAndFacets(data);
    const { uniqueNonAggregates } = getUniqueNonAggregates(data);

    return uniqueAggregates.size >= 2 || uniqueNonAggregates.size >= 2;
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

              if (error && data === null) {
                return (
                  <NrqlQueryError
                    title="NRQL Syntax Error"
                    description={error.message}
                  />
                );
              }

              if (!data.length) {
                return <NoDataState />;
              }

              if (!this.nrqlInputIsValid(data)) {
                return (
                  <NrqlQueryError
                    title="Unsupported NRQL query"
                    description="The provided NRQL query is not supported by this visualization. This chart supports non-aggregate and aggregate queries with an optional FACET clause. Please make sure to have 2-3 aggregate functions or 2-3 attributes in the SELECT clause."
                  />
                );
              }
              const { series } = this.transformData(data);
              console.dir(series);
              return (
                <VictoryChart theme={VictoryTheme.material}>
                  <VictoryScatter
                    size={7}
                    data={series}
                    style={{
                      data: {
                        fill: ({ datum }) => datum.color,
                        fillOpacity: 0.7,
                        strokeWidth: 3,
                      },
                    }}
                  />
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
        Please provide at least one NRQL query & account ID pair
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
        type={HeadingText.TYPE.HEADING_4}
      >
        An example NRQL query you can try is:
      </HeadingText>
      <code>
        FROM Transaction SELECT average(duration), max(totalTime),
        max(databaseDuration) FACET appName
      </code>
    </CardBody>
  </Card>
);

const ErrorState = () => (
  <Card className="ErrorState">
    <CardBody className="ErrorState-cardBody">
      <HeadingText
        className="ErrorState-headingText"
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Oops! Something went wrong.
      </HeadingText>
    </CardBody>
  </Card>
);
