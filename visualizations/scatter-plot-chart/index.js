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
  VictoryScatter,
  VictoryContainer,
  VictoryAxis,
  VictoryLabel,
  VictoryTooltip,
} from 'victory';
import Legend from '../../src/legend';
import NrqlQueryError from '../../src/nrql-query-error/nrql-query-error';
import theme from '../../src/theme';
import {
  getUniqueAggregatesAndFacets,
  getUniqueNonAggregates,
} from '../../src/utils/nrql-validation-helper';
import NoDataState from '../../src/no-data-state';
import { getFacetLabel } from '../../src/utils/facets';
import { formatNumberTicks, typeToUnit } from '../../src/utils/units';

const tooltipTextStyles = {
  fontFamily: 'var(--nr1--typography--body--1--font-family)',
  fontWeight: 'var(--nr1--typography--body--1--font-weight)',
  fontSize: 10,
};

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

  getAggregatesData = (rawData, functionDisplayNames) => {
    const queryHasZField = functionDisplayNames.length > 2;

    // `rawData` contains an entry per combo of aggregate function and facet. Here
    // we reduce that structure to an entry per facet each of which contains the
    // all of the facet's aggregate function values.
    const facetGroupData = rawData.reduce((acc, { data, metadata }) => {
      const facetGroupName = getFacetLabel(metadata?.groups);
      const dataValue = data?.[0]?.y;
      const unitType = metadata?.units_data?.y;
      const aggregateFunction = metadata?.groups.filter(
        (group) => group.type === 'function'
      )[0];
      const functionDisplayName = aggregateFunction?.displayName;
      const functionPosition =
        functionDisplayNames.indexOf(functionDisplayName);

      if (!(facetGroupName in acc)) {
        acc[facetGroupName] = {};
      }

      switch (functionPosition) {
        case 0:
          // The first aggregate function determines the x axis value
          acc[facetGroupName].color = metadata.color;
          acc[facetGroupName].x = dataValue;
          acc[facetGroupName].xUnitType = unitType;
          acc[facetGroupName].xDisplayName = functionDisplayName;
          break;
        case 1:
          // The second aggregate function determines the y axis value
          acc[facetGroupName].y = dataValue;
          acc[facetGroupName].yUnitType = unitType;
          acc[facetGroupName].yDisplayName = functionDisplayName;
          break;
        case 2:
          // If present, the third aggregate function determines the size
          acc[facetGroupName].z = dataValue;
          acc[facetGroupName].zUnitType = unitType;
          acc[facetGroupName].zDisplayName = functionDisplayName;
          break;
      }

      return acc;
    }, {});

    const series = Object.entries(facetGroupData).map(
      ([facetGroupName, facetGroupData]) => ({
        facetGroupName,
        ...facetGroupData,
      })
    );

    return queryHasZField
      ? series.filter((entry) => entry.z !== null && entry.z !== undefined)
      : series;
  };

  getNonAggregatesData = (rawData) => {
    let queryHasZField = false;
    const { uniqueNonAggregates } = getUniqueNonAggregates(rawData);
    const attributeNames = Array.from(uniqueNonAggregates);
    const series = rawData[0].data.map((point) => {
      const datapoint = {
        x: point[attributeNames[0]],
        xDisplayName: attributeNames[0],
        y: point[attributeNames[1]],
        yDisplayName: attributeNames[1],
        color: rawData[0].metadata.color,
      };
      if (point[attributeNames[2]]) {
        queryHasZField = true;
        datapoint.z = point[attributeNames[2]];
        datapoint.zDisplayName = attributeNames[2];
      }

      return datapoint;
    });

    return queryHasZField
      ? series.filter((entry) => entry.z !== null && entry.z !== undefined)
      : series;
  };

  transformData = (data) => {
    const { uniqueNonAggregates } = getUniqueNonAggregates(data);
    if (uniqueNonAggregates.size > 1) {
      return this.getNonAggregatesData(data);
    }

    const { uniqueAggregates } = getUniqueAggregatesAndFacets(data);
    if (uniqueAggregates.size > 1) {
      return this.getAggregatesData(data, Array.from(uniqueAggregates));
    }

    return null;
  };

  nrqlInputIsValid = (data) => {
    const { uniqueAggregates } = getUniqueAggregatesAndFacets(data);
    const { uniqueNonAggregates } = getUniqueNonAggregates(data);

    return uniqueAggregates.size >= 2 || uniqueNonAggregates.size >= 2;
  };

  getXAxisLabelProps = (data, transformedData, height) => {
    const { uniqueAggregates } = getUniqueAggregatesAndFacets(data);
    const { uniqueNonAggregates } = getUniqueNonAggregates(data);
    const uniqueAttributeNames = Array.from(uniqueNonAggregates);
    const uniqueAggregatesNames = Array.from(uniqueAggregates);

    // `unitType` is a value to map NRQL data with units -- only works with Aggregate Queries
    const unitType = data[0].metadata.units_data.y
      ? data[0].metadata.units_data.y
      : 'UNKNOWN';

    let label;
    let xDomainValues;

    if (uniqueAggregates.size > 1) {
      label = `${uniqueAggregatesNames[0]}${typeToUnit(unitType)}`;

      xDomainValues = transformedData
        .filter((datapoint) => {
          return datapoint.xDisplayName === uniqueAggregatesNames[0];
        })
        .map(({ x }) => x);
    } else if (uniqueNonAggregates.size > 1) {
      label = `${uniqueAttributeNames[0]}${typeToUnit(unitType)}`;
      xDomainValues = transformedData.map((point) => point.x);
    }

    // find the increment of ticks to determine decimal formatting
    const tickCount = Math.round((height - 50) / 70);
    const xMin = Math.min(...xDomainValues);
    const xMax = Math.max(...xDomainValues);
    const tickIncrement = (xMax - xMin) / tickCount;

    return {
      label,
      tickCount,
      tickFormat: (tick) =>
        formatNumberTicks({
          unitType,
          tick,
          tickIncrement,
        }),
    };
  };

  getYAxisLabelProps = (data, transformedData, height) => {
    const { uniqueAggregates } = getUniqueAggregatesAndFacets(data);
    const { uniqueNonAggregates } = getUniqueNonAggregates(data);
    const uniqueAttributeNames = Array.from(uniqueNonAggregates);
    const uniqueAggregatesNames = Array.from(uniqueAggregates);
    // `unitType` is a value to map NRQL data with units
    const unitType = data[0].metadata.units_data.y
      ? data[0].metadata.units_data.y
      : 'UNKNOWN';
    let label;
    let yDomainValues;

    if (uniqueAggregates.size > 1) {
      label = `${uniqueAggregatesNames[1]}${typeToUnit(unitType)}`;

      yDomainValues = transformedData
        .filter((datapoint) => {
          return datapoint.yDisplayName === uniqueAggregatesNames[1];
        })
        .map(({ y }) => y);
    } else if (uniqueNonAggregates.size > 1) {
      label = `${uniqueAttributeNames[1]}${typeToUnit(unitType)}`;
      yDomainValues = transformedData.map((point) => point.y);
    }

    // find the increment of ticks to determine decimal formatting
    const tickCount = Math.round((height - 50) / 70);
    const yMin = Math.min(...yDomainValues);
    const yMax = Math.max(...yDomainValues);
    const tickIncrement = (yMax - yMin) / tickCount;

    return {
      label,
      tickCount,
      tickFormat: (tick) =>
        formatNumberTicks({
          unitType,
          tick,
          tickIncrement,
        }),
    };
  };

  tooltipLabel = ({ datum }) => {
    const lines = [];

    if ('facetGroupName' in datum) {
      lines.push(datum.facetGroupName);
    }

    lines.push(this.valueLabel(datum.xDisplayName, datum.x, datum.xUnitType));
    lines.push(this.valueLabel(datum.yDisplayName, datum.y, datum.yUnitType));

    if ('z' in datum) {
      lines.push(this.valueLabel(datum.zDisplayName, datum.z, datum.zUnitType));
    }

    return lines;
  };

  valueLabel = (displayName, value, unitType) =>
    `${displayName}: ${value?.toLocaleString() ?? ''}${
      typeToUnit(unitType) ?? ''
    }`;

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
              const { uniqueAggregates } = getUniqueAggregatesAndFacets(data);
              const series = this.transformData(data);

              const legendItems = series.reduce((acc, curr) => {
                if (!acc.some(({ label }) => label === curr.facetGroupName)) {
                  acc.push({ label: curr.facetGroupName, color: curr.color });
                }
                return acc;
              }, []);

              const chartLeftPadding = 100;
              const chartRightPadding = 25;
              const legendHeight = 50;
              const spaceBelowLegend = 16;

              const xAxisLabelProps = this.getXAxisLabelProps(
                data,
                series,
                height
              );

              // `yDomainWidth` represents the maximum width of the ticks for y-axis
              const yDomainWidth = 50;
              const yAxisPadding = 16;

              const yAxisLabelProps = this.getYAxisLabelProps(
                data,
                series,
                height
              );

              return (
                <>
                  <VictoryChart
                    containerComponent={<VictoryContainer responsive={false} />}
                    width={width}
                    height={height - legendHeight - spaceBelowLegend}
                    padding={{
                      top: 16,
                      bottom: 60,
                      left: chartLeftPadding,
                      right: chartRightPadding,
                    }}
                    theme={theme}
                  >
                    <VictoryAxis
                      {...xAxisLabelProps}
                      style={{
                        axisLabel: { padding: 35 },
                      }}
                    />
                    <VictoryAxis
                      {...yAxisLabelProps}
                      dependentAxis
                      style={{
                        axisLabel: { padding: yDomainWidth + yAxisPadding },
                      }}
                    />
                    <VictoryScatter
                      data={series}
                      style={{
                        data: {
                          fill: ({ datum }) => datum.color,
                          fillOpacity: 0.7,
                        },
                      }}
                      labels={this.tooltipLabel}
                      labelComponent={
                        <VictoryTooltip
                          labelComponent={
                            <VictoryLabel
                              lineHeight={1.4}
                              style={[
                                {
                                  ...tooltipTextStyles,
                                  fontWeight:
                                    uniqueAggregates.size > 1
                                      ? 'var(--nr1--typography--heading--6--font-weight)'
                                      : tooltipTextStyles.fontWeight,
                                },
                                tooltipTextStyles,
                                tooltipTextStyles,
                                tooltipTextStyles,
                              ]}
                            />
                          }
                          horizontal
                          constrainToVisibleArea
                          pointerLength={8}
                          dx={5}
                          flyoutStyle={{
                            stroke: ({ datum }) => datum.color,
                            strokeWidth: 2,
                            filter: 'none',
                          }}
                        />
                      }
                    />
                  </VictoryChart>
                  {uniqueAggregates.size > 1 && (
                    <Legend
                      style={{
                        height: legendHeight,
                        marginLeft: chartLeftPadding,
                        marginRight: chartRightPadding,
                      }}
                      items={legendItems}
                    />
                  )}
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
