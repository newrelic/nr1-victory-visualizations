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

  constructor() {
    super();
    this.state = {
      percent: 25,
      data: this.getData(0),
    };
  }

  componentDidMount() {
    let percent = 25;
    this.setStateInterval = window.setInterval(() => {
      percent += Math.random() * 25;
      percent = percent > 100 ? 0 : percent;
      this.setState({
        percent,
        data: this.getData(percent),
      });
    }, 2000);
  }

  componentWillUnmount() {
    window.clearInterval(this.setStateInterval);
  }

  getData(percent) {
    return [
      { x: 1, y: percent },
      { x: 2, y: 100 - percent },
    ];
  }

  /**
   * Restructure the data for a non-time-series, facet-based NRQL query into a
   * form accepted by the Recharts library's RadarChart.
   * (https://recharts.org/api/RadarChart).
   */
  transformData = (rawData) => {
    return rawData.map((entry) => ({
      name: entry.metadata.name,
      // Only grabbing the first data value because this is not time-series data.
      value: entry.data[0].y,
    }));
  };

  /**
   * Format the given axis tick's numeric value into a string for display.
   */
  formatTick = (value) => {
    return value.toLocaleString();
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
                      data={this.state.data}
                      innerRadius={120}
                      cornerRadius={25}
                      labels={() => null}
                      style={{
                        data: {
                          fill: ({ datum }) => {
                            const color = datum.y > 30 ? 'green' : 'red';
                            return datum.x === 1 ? color : 'transparent';
                          },
                        },
                      }}
                    />
                    <VictoryAnimation duration={1000} data={this.state}>
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
        Please provide at least one NRQL query & account ID pair
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
        type={HeadingText.TYPE.HEADING_4}
      >
        An example NRQL query you can try is:
      </HeadingText>
      <code>FROM NrUsage SELECT sum(usage) FACET metric SINCE 1 week ago</code>
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
