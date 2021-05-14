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
import { VictoryChart, VictoryTheme, VictoryBar, VictoryAxis } from 'victory';

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

  transformData = (rawData) => {
    /*
      data[i].metadata.color --> for bar fill color
      data[i].metadata.groups --> for type === facet, use value as group key
      data[i].data[0].y --> first time we come across the entry, use `y` as y0 value and for second time use `y` as y value
    */

    const { facetGroupData, tickValues } = rawData.reduce(
      (acc, { data, metadata }) => {
        const facetGroupName = metadata?.groups?.reduce(
          (stringAcc, { type, value }) => {
            if (type === 'facet') {
              stringAcc = stringAcc === '' ? value : `${stringAcc}, ${value}`;
            }
            return stringAcc;
          },
          ''
        );
        const dataValue = data?.[0]?.y;

        acc.tickValues.add(facetGroupName);

        acc.facetGroupData[facetGroupName]
          ? (acc.facetGroupData[facetGroupName].y = dataValue)
          : (acc.facetGroupData[facetGroupName] = {
              color: metadata?.color,
              y0: dataValue,
            });

        return acc;
      },
      { facetGroupData: {}, tickValues: new Set() }
    );

    const rangeData = Object.entries(facetGroupData).map(
      ([facetGroupName, facetGroupData]) => ({
        facetGroupName,
        ...facetGroupData,
      })
    );

    return { rangeData, tickValues: Array.from(tickValues) };
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

              try {
                const { rangeData, tickValues } = this.transformData(data);
                return (
                  <VictoryChart
                    domainPadding={15}
                    theme={VictoryTheme.material}
                    height={height}
                    width={width}
                  >
                    <VictoryAxis tickValues={tickValues} />
                    <VictoryAxis dependentAxis />
                    <VictoryBar
                      style={{
                        data: {
                          fill: ({ datum }) => datum.color,
                        },
                      }}
                      data={rangeData}
                      y={(datum) => {
                        return datum.y;
                      }}
                      y0={(datum) => datum.y0}
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

