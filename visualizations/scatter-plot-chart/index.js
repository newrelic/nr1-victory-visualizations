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
import { VictoryChart, VictoryScatter } from 'victory';
import NrqlQueryError from '../../src/nrql-query-error/nrql-query-error';
import theme from '../../src/theme';
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

  getAggregatesData = (rawData) => {
    const facetGroupData = rawData.reduce((acc, { data, metadata }) => {
      const facetGroupName = getFacetLabel(metadata?.groups);
      const dataValue = data?.[0]?.y;
      const unitType = metadata.units_data.y;

      acc[facetGroupName]
        ? acc[facetGroupName].y
          ? (acc[facetGroupName] = {
              ...acc[facetGroupName],
              size: dataValue,
            })
          : (acc[facetGroupName] = {
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

  getNonAggregatesData = (rawData) => {
    const { uniqueNonAggregates } = getUniqueNonAggregates(rawData);
    const attributeNames = Array.from(uniqueNonAggregates);
    const series = rawData[0].data.map((point) => {
      const datapoint = {
        x: point[attributeNames[0]],
        y: point[attributeNames[1]],
        color: rawData[0].metadata.color,
      };
      if (point[attributeNames[2]]) datapoint.size = point[attributeNames[2]];

      return datapoint;
    });
    return series;
  };

  transformData = (data) => {
    const { uniqueAggregates, uniqueFacets } =
      getUniqueAggregatesAndFacets(data);
    const { uniqueNonAggregates } = getUniqueNonAggregates(data);
    let series;

    if (uniqueNonAggregates.size > 1) {
      series = this.getNonAggregatesData(data);
    } else if (uniqueAggregates.size > 1) {
      series = this.getAggregatesData(data);
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

    const defaultPlotSize = 1;

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
              return (
                <VictoryChart theme={theme}>
                  <VictoryScatter
                    size={defaultPlotSize}
                    data={series}
                    style={{
                      data: {
                        fill: ({ datum }) => datum.color,
                        fillOpacity: 0.7,
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
