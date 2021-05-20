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
import ErrorState from '/src/error-state';
import { baseLabelStyles } from '/src/theme';

const BOUNDS = {
  X: 400,
  Y: 400,
};

const LABEL_SIZE = 24;
const LABEL_PADDING = 10;
const CHART_WIDTH = BOUNDS.X;
const CHART_HEIGHT = BOUNDS.Y - LABEL_SIZE - LABEL_PADDING;

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
  transformData = (data) => {
    const {
      data: [series],
      metadata: { color, name: label },
    } = data[0];

    const percent = series.y * 100;

    return {
      percent,
      label,
      series: [
        { x: 'progress', y: percent, color },
        { x: 'remainder', y: 100 - percent, color: 'transparent' },
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

              const { percent, label, series } = this.transformData(data);

              return (
                <div>
                  <svg
                    viewBox={`0 0 ${BOUNDS.X} ${BOUNDS.Y}`}
                    width={width}
                    height={height}
                    className="ProgressBarChart"
                  >
                    <VictoryPie
                      standalone={false}
                      animate={{ duration: 1000 }}
                      data={series}
                      width={CHART_WIDTH}
                      height={CHART_HEIGHT}
                      padding={10}
                      innerRadius={135}
                      cornerRadius={25}
                      labels={() => null}
                      style={{
                        data: {
                          fill: ({ datum }) => datum.color,
                        },
                      }}
                    />
                    <VictoryAnimation duration={1000} data={percent}>
                      {(percent, info) => (
                        <VictoryLabel
                          textAnchor="middle"
                          verticalAnchor="middle"
                          x={CHART_WIDTH / 2}
                          y={CHART_HEIGHT / 2}
                          text={`${Math.round(percent)}%`}
                          style={{ ...baseLabelStyles, fontSize: 45 }}
                        />
                      )}
                    </VictoryAnimation>
                    <VictoryLabel
                      text={label}
                      lineHeight={1}
                      x={CHART_WIDTH / 2}
                      y={BOUNDS.Y - LABEL_SIZE}
                      textAnchor="middle"
                      style={{ ...baseLabelStyles, fontSize: LABEL_SIZE }}
                    />
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
