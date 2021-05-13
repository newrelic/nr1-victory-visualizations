import React from 'react';
import PropTypes from 'prop-types';
import { VictoryPie, VictoryAnimation, VictoryLabel } from 'victory';
import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  AutoSizer,
} from 'nr1';

export default class ProgressBarVisualization extends React.Component {
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
   * Restructure the data for a aggegate NRQL query with no TIMESERIES and no
   * FACET into a for our visualization works well with.
   */
  transformData = (rawData) => {
    const percent = rawData[0].data[0].y * 100;
    const color = rawData[0].metadata.color;
    return {
      percent,
      color,
      pieChartData: [
        { x: 'progress', y: percent },
        { x: 'remainder', y: 100 - percent },
      ],
    };
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

              const transformedData = this.transformData(data);

              return (
                <div>
                  <svg viewBox="0 0 400 400" width={width} height={height}>
                    <VictoryPie
                      standalone={false}
                      animate={{ duration: 1000 }}
                      width={400}
                      height={400}
                      data={transformedData.pieChartData}
                      innerRadius={120}
                      cornerRadius={25}
                      labels={() => null}
                      style={{
                        data: {
                          fill: ({ datum }) => {
                            return datum.x === 'progress'
                              ? transformedData.color
                              : 'transparent';
                          },
                        },
                      }}
                    />
                    <VictoryAnimation duration={1000} data={transformedData}>
                      {(newProps) => {
                        return (
                          <VictoryLabel
                            textAnchor="middle"
                            verticalAnchor="middle"
                            x={200}
                            y={200}
                            text={`${Math.round(newProps.percent)}%`}
                            style={{ fontSize: 45 }}
                          />
                        );
                      }}
                    </VictoryAnimation>
                  </svg>
                </div>
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
        This Visualization supports NRQL queries with a single SELECT clause
        returning a percentage value (0 to 100 rathern than 0 to 1). For
        example:
      </HeadingText>
      <code>
        {'FROM EventType SELECT percentage(count(*), WHERE duration < 0.1)'}
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
