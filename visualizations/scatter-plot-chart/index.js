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
import { getUniqueAggregatesAndFacets } from '../../src/utils/nrql-validation-helper';

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

	nrqlInputIsValid = (data) => {
    const { uniqueAggregates, uniqueFacets } = getUniqueAggregatesAndFacets(data);

		if (uniqueAggregates.size <= 3 && uniqueAggregates.size > 1 && uniqueFacets.size <= 1) return true;
		else if (uniqueAggregates.size === 1) return false;
		else return uniqueAggregates.size === 0 && uniqueFacets.size <= 1;
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
								return <NrqlQueryError
									title='NRQL Syntax Error'
									description={error.message}
								/>;
							}
							console.log('data', data);

							if (!this.nrqlInputIsValid(data)) {
								return (
									<NrqlQueryError
										title="Unsupported NRQL query"
										description="The provided NRQL query is not supported by this visualization. This chart supports non-aggregate and aggregate queries with an optional FACET clause. Please make sure to have 2-3 aggregate functions in the SELECT clause if it is an aggregate query."
									/>
								);
							}

							return (
								<VictoryChart
									theme={VictoryTheme.material}
									domain={{ x: [0, 5], y: [0, 7] }}
								>
									<VictoryScatter
										style={{ data: { fill: "#c43a31" } }}
										size={7}
										data={[
											{ x: 1, y: 2 },
											{ x: 2, y: 3 },
											{ x: 3, y: 5 },
											{ x: 4, y: 4 },
											{ x: 5, y: 7 }
										]}
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
				SELECT contentLength, duration, externalCallCount FROM EventType
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
