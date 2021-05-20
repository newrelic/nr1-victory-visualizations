# Victory charts visualizations
Visualize your New Relic data with Victory charts!

1. [Add this Nerdpack to your account](https://developer.newrelic.com/build-apps/publish-deploy/subscribe/)
2. Select one of the Nerdpack's visualizations
3. Choose your New Relic account
4. Enter a [NRQL query](https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/introduction-nrql-new-relics-query-language/)

After configuring your visualization, [add it to a dashboard](https://docs.newrelic.com/docs/query-your-data/explore-query-data/dashboards/add-custom-visualizations-your-dashboards/) to see your data.

## Multifacet Bar Chart
This visualization allows users to plot data with multiple facets in a stacked bar chart view. 

For example, if you query `SELECT average(duration) FROM Transaction FACET appName, environment`, you'll see the average duration of a `Transaction` event in a stacked bar chart where: 

- Each **bar** represents a different `environment` (production, development, etc.) 
- Each **segment** of the bar represents a different `appName`

This is ideal for visualizing related facets with respect to some numeric or aggregate attribute. 

### Props Config
These are the values that are configurable by a user via the Custom Visualizations Nerdlet or by editing on a dashboard. In order to use the visualization, you must provide: 

| Prop  | Usage      | Required |
| -------------- | ----------- | ----------- |
| `nrqlQueries`     | A collection of NRQL queries. This visualization only accepts one query. See [Multifacet NRQL Data Details](#multifacet-nrql-data-details) for more details on accepted NRQL queries.      | Required    |
| `accountId`   | Associated account ID for the data you wish to plot. | Required     |


### Multifacet NRQL Data Details

This visualization accepts a NRQL query in the form:

 ```
 SELECT [numeric attribute or aggregate of attribute] FROM [event] FACET [attribute1, attribute2, ...]
 ``` 
 The query requires the selected attribute to be either numeric or an aggregate function. The query also requires atleast 1 facet. The presence of 1 facet will give a standard bar chart view.

| NRQL feature   | Usage      | Required |
| -------------- | ----------- | ----------- |
| All but last facet attribute     | X axis label or bar on bar chart      | Required (`string` or `boolean`)     |
| Last facet attribute   | Bar color or segment of bar on bar chart       | Required (`string` or `boolean`)       |
| Aggregate or numeric attribute   | Y axis value or bar height       | Required (`numeric`)       |


## Range Chart
This visualization allows users to visualize the range of numeric attributes grouped by a facet. 

For example, the query `FROM Transaction SELECT percentile(duration, 5), percentile(duration, 95)  FACET dateOf(timestamp) SINCE 7 days ago` will show the given 95th percentile of the duration as the top bar and 5th percentile of the duration as the bottom bar for each day of the last week. 

### Props Config
These are the values that are configurable by a user via the Custom Visualizations Nerdlet or by editing on a dashboard. In order to use the visualization, you must provide: 
| Prop  | Usage      | Required |
| -------------- | ----------- | ----------- |
| `nrqlQueries`     | A collection of NRQL queries. This visualization only accepts a singular NRQL query. see [Range Chart NRQL Data Details](#range-chart-nrql-data-details) section for more details on accepted NRQL queries.      | Required    |
| `accountId`   | Associated account ID for the data you wish to plot. | Required     |


### Range Chart NRQL Data Details

This visualization accepts a NRQL query in the form:

 ```
 SELECT [aggregate1, aggregate2] FROM [event] FACET [attribute]
 ``` 

 The query requires two aggregate functions to act as the top and bottom of the range for a facet. 

| NRQL feature   | Usage      | Required |
| -------------- | ----------- | ----------- |
| First aggregate     | Y axis position of top of range bar      | Required (`numeric` or aggregate)     |
| Second aggregate   | Y axis position of bottom of range bar       | Required (`numeric` or aggregate)        |
| Facet     | X axis position or x axis label   | Required (`string` or `boolean`)       |

## Progress Bar

This visualization allows users to visualize a percent of a whole. It is similar to the `bullet` chart available, but provides coloring specific to the percentage of the whole, provides a circular representation of the data, and emphasizes the percentage. This visualization allows users to guage progress or see if they are meeting certain limits.

For example, the query `FROM PageView SELECT percentage(count(*), WHERE duration < 1)` will show out of the total number of actions in the `PageView` event, what percentage were under 1 second. 

### Props Config

These are the values that are configurable by a user via the Custom Visualizations Nerdlet or by editing on a dashboard. In order to use the visualization, you must provide: 
| Prop  | Usage      | Required |
| -------------- | ----------- | ----------- |
| `nrqlQueries`     | A collection of NRQL queries. This visualization only accepts a singular NRQL query. see [Progress Bar NRQL Data Details](#range-chart-nrql-data-details) section for more details on accepted NRQL queries.      | Required    |
| `accountId`   | Associated account ID for the data you wish to plot. | Required     |


### Progress Bar NRQL Data Details

This visualization accepts a NRQL query in the form:

 ```
 SELECT [percentage(aggregate(attribute), WHERE...) or numeric_attribute1/numeric_attribute2 or numeric attribute] FROM [event] 
 ``` 

You must supply a percentage or fractional value of two attributes. For example, `SELECT filter(count(*), WHERE duration < 1)/filter(count(*), WHERE duration < 2) FROM PageView` gives the number of `PageView` events that last less than one second over the number of events that last less than two seconds. 

| NRQL feature   | Usage      | Required |
| -------------- | ----------- | ----------- |
| `percentage(aggregate(attribute), WHERE...)` or numeric attribute | Fill of circle over 100     | Required (`numeric` less than 1, aggregate functions or mathematical operations that return less a percentage or fraction)     |

## Learn More

* To learn more about custom visualizations, read through our [introduction to the topic](https://developer.newrelic.com/explore-docs/custom-viz/) or some of our [guides for building on New Relic](https://developer.newrelic.com/build-apps/).
* To learn more about these visualizations, visit our [`repo`](https://github.com/newrelic/nr1-victory-visualizations).
* To learn more about the attributes and events available in NRQL, visit the [Attribute Dictionary](https://docs.newrelic.com/attribute-dictionary/) on docs.newrelic.com. 
