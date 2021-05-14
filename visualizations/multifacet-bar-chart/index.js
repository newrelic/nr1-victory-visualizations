import React from "react";
import PropTypes from "prop-types";
import { VictoryChart, VictoryGroup, VictoryBar, VictoryAxis } from "victory";

import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  AutoSizer,
} from "nr1";

const getNumBuckets = (data) => {
  return data.reduce((acc, curr) => acc + curr.length, 0);
}

export default class VictoryBarChartVisualization extends React.Component {
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
   * Group the data by facet.
   * Shape of result:
   *  [
   *    [
   *        { x: "us-west, production", y: 1, groupLabel: 'catalog-service' },
   *        { x: "us-west, eu-production", y: 2, groupLabel: 'catalog-service' },
   *        { x: "us-east, production", y: 1, groupLabel: 'catalog-service' },
   *        { x: "us-east, eu-production", y: 2, groupLabel: 'catalog-service' },
   *    ],
   *    ...
   *  ]
   *
   * Handles "Other" facet
   *
   * TODO: rewrite with reduce
   * TODO: try relying on the data accessor approach (does it support array index access?)
   *
   */
  transformData = (data) => {

    //create an object that maps all of the partitions that colorFacets into groupings by the labelFacets
    const facetGroups = data.reduce((acc, curr)=> {
      const {metadata, data} = curr; 
      const [xLabelFacet, colorFacet] = metadata.name.split(',').map(name => name.trim()); 

      if (acc[colorFacet]) {
        acc[colorFacet][xLabelFacet] = data[0].y
      } else {
        acc[colorFacet] = {[xLabelFacet]: data[0].y}
      }

      return acc;
      
    },{})

    //transform this into an array of arrays that can be read by Victory
    const transformed = Object.entries(facetGroups).map(([colorFacet, entry]) => {
      return Object.entries(entry).map(([key, value]) => ({groupLabel: colorFacet, x: key, y: value})); 
    })

    console.log({transformed})

    return transformed;
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
                console.log({ error });
                return <ErrorState />;
              }

              const transformedData = this.transformData(data);

              const numBuckets = getNumBuckets(transformedData); 

              //width of labels 
              const offsetX = 80; 
              //space between each bar
              const spaceBetweenBars = 5;
              const barWidth = (width/(numBuckets+50))

              return (
                <VictoryChart domainPadding={{ x: offsetX }} width={width} height={height} padding={{ top: 20, bottom: 40, left: 80, right: 20 }}>
                  <VictoryGroup offset={barWidth+spaceBetweenBars} width={width} style={{data: {width: barWidth}}} colorScale={"qualitative"}>
                    {transformedData.map((series) => (
                      <VictoryBar data={series} />
                    ))}
                  </VictoryGroup>
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