# Victory Charts Visualizations
Visualize your New Relic data with Victory charts!

1. [Add this Nerdpack to your account](https://developer.newrelic.com/build-apps/publish-deploy/subscribe/)
2. Select one of the Nerdpack's visualizations
3. Choose your New Relic account
4. Enter a [NRQL query](https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/introduction-nrql-new-relics-query-language/)

After configuring your visualization, [add it to a dashboard](https://docs.newrelic.com/docs/query-your-data/explore-query-data/dashboards/add-custom-visualizations-your-dashboards/) to see your data.

## Stacked bar chart
Plot multifaceted data in a stacked bar chart view.

For example, if you query `SELECT average(duration) FROM Transaction FACET environment, appName`, you'll see the average duration of a `Transaction` event in a stacked bar chart where: 

- Each **bar** represents a different `environment` (production, development, etc.) 
- Each **segment** of the bar represents a different `appName`

This is ideal for visualizing related facets with respect to some numeric or aggregate attribute. 

### Props Config
Edit these values in the Custom Visualizations Nerdlet or directly in the visualization's dashboard widget. 

To use the visualization, provide the following properties: 

| Prop  | Usage      | Required |
| -------------- | ----------- | ----------- |
| `nrqlQueries`     | A collection of NRQL queries. This visualization only accepts one query. See [Multifacet NRQL Data Details](#multifacet-nrql-data-details) for more details on accepted NRQL queries.      | Yes    |
| `accountId`   | Associated account ID for the data you wish to plot. | Yes     |
| `other.visible`   | A toggle that controls the display of "other" groups of attributes | No     |
| `yAxis.label`   | A custom label to describe the y-axis | No     |


### Stacked bar chart NRQL Data Details

This visualization accepts a NRQL query in the form:

 ```
 SELECT [numeric attribute or aggregate of attribute] FROM [event] FACET [attribute1, attribute2, ...]
 ``` 

You must select an attribute that's either numeric or an aggregate function. You must also specify at least one facet. 

> **Note:** If you only specify one facet in your query, you'll have a standard bar chart.

| NRQL feature   | Usage      | Type |
| -------------- | ----------- | ----------- |
| All but last facet attribute     | X-axis label or bar on bar chart      | `string` or `boolean`     |
| Last facet attribute   | Bar color or segment of bar on bar chart       | `string` or `boolean`       |
| Aggregate    | Y-axis value or bar height       | aggregate function    |

#### Example NRQL Queries

```
SELECT count(*) FROM PageAction WHERE actionName = 'clickSignUpButton' FACET pageUrl, deviceType 
```

In the above query, you can visualize:
* number of times a user clicked the sign up button on your site
* what pages those events occurred on
* what devices people tend to click the button 

```
SELECT average(duration) FROM TransactionError FACET errorType, appName
```

In the above query, you can see: 
* average duration for transaction errors for each `appName`
* how the duration is broken up for each `errorType`



## Range Chart
Visualize the range of numeric attributes grouped by a facet. 

For example, if you query `FROM Transaction SELECT percentile(duration, 5), percentile(duration, 95)  FACET dateOf(timestamp) SINCE 7 days ago` you'll see a bar for each day of the last week where:

- The top segment shows the 95th percentile of the duration
- The bottom segment shows the 5th percentile of the duration

### Props Config
Edit these values in the Custom Visualizations Nerdlet or directly in the visualization's dashboard widget. 

To use the visualization, provide the following properties: 
| Prop  | Usage      | Required |
| -------------- | ----------- | ----------- |
| `nrqlQueries`     | A collection of NRQL queries. This visualization only accepts one query. See [Range Chart NRQL Data Details](#range-chart-nrql-data-details) for more details on accepted NRQL queries.      | Yes    |
| `accountId`   | Associated account ID for the data you wish to plot. | Yes     |
| `other.visible`   | A toggle that controls the display of "other" groups of attributes | No     |


### Range Chart NRQL Data Details

This visualization accepts a NRQL query in the form:

 ```
 SELECT [aggregate1, aggregate2] FROM [event] FACET [attribute]
 ``` 

You must supply two aggregate functions to act as the top and bottom of the range for a facet. 

| NRQL feature   | Usage      | Type |
| -------------- | ----------- | ----------- |
| First aggregate     | Y-axis position of top of range bar      | aggregate function     |
| Second aggregate   | Y-axis position of bottom of range bar       | aggregate function       |
| Facet     | X-axis position or x-axis label   | `string` or `boolean`      |

#### Example NRQL Queries

```
SELECT max(duration), min(duration) FROM Transaction FACET appName SINCE 1 day ago
```

In the above query, you will see: 
* the max duration since a day ago for each appName
* the min duration since a day ago for each appName
* how much of a difference there is between the min and the max

```
SELECT average(duration) + stddev(duration), average(duration) - stddev(duration) FROM Transaction FACET appName SINCE 1 day ago
```

In the above query, you will see: 
* the range of one standard deviation above the average duration
* the range of one standard deviation below the average duration
* how much `Transaction` events vary for each app

## Circular progress bar

Visualize your progress toward a limit or goal.

This chart is similar to the New Relic [Bullet chart](https://docs.newrelic.com/docs/query-your-data/explore-query-data/use-charts/chart-types/#bullet-chart) but with the following differences: 

- It provides specific coloring related to the completion percentage
- It provides a circular representation of the data
- It emphasizes the percentage

For example, if you query `FROM PageView SELECT percentage(count(*), WHERE duration < 1)`, you'll see what percentage of page views were shorter than one second.

### Props Config

Edit these values in the Custom Visualizations Nerdlet or directly in the visualization's dashboard widget. 

To use the visualization, provide the following properties: 
| Prop  | Usage      | Required |
| -------------- | ----------- | ----------- |
| `nrqlQueries`     | A collection of NRQL queries. This visualization only accepts one query. See [Progress Bar NRQL Data Details](#progress-bar-nrql-data-details) for more details on accepted NRQL queries.      | Yes    |
| `accountId`   | Associated account ID for the data you wish to plot. | Yes     |
| `criticalThreshold`   | Value at which progress is displayed as critical | No     |
| `highValuesAreSuccess`   | If toggled on, values above the threshold display as successful. Otherwise, values at or above the threshold display as critical. | No     |


### Circular progress bar NRQL Data Details

This visualization accepts a NRQL query in the form:

 ```
 SELECT [percentage(aggregate(attribute), WHERE...) or numeric_attribute1/numeric_attribute2 or numeric attribute] FROM [event] 
 ``` 

You must supply a percentage or fractional value of two attributes. For example, `SELECT filter(count(*), WHERE duration < 1)/filter(count(*), WHERE duration < 2) FROM PageView` gives the number of `PageView` events that last less than one second over the number of events that last less than two seconds. 

| NRQL feature   | Usage      | Type |
| -------------- | ----------- | ----------- |
| `percentage(aggregate(attribute), WHERE...)` or numeric attribute | Fill of circle over 100     | aggregate functions or mathematical operations that return a percentage or fraction value less than 1     |

#### Example NRQL Queries

```
SELECT percentage(count(*), WHERE actionName = 'clickButton') FROM PageAction SINCE 2 weeks ago
```
In the above query, you will see what percentage of actions on your site were a user clicking a button!

```
SELECT average(StorageDataUsagePercent) FROM ContainerSamples 
```
In the above query, you can use the percentage value of `StorageDataUsagePercent` to visualize how much data is being used on average! 


## Learn More

* To learn more about custom visualizations, read through our [introduction to the topic](https://developer.newrelic.com/explore-docs/custom-viz/) or some of our [guides for building on New Relic](https://developer.newrelic.com/build-apps/).
* To learn more about these visualizations, visit our [`repo`](https://github.com/newrelic/nr1-victory-visualizations).
* To learn more about the attributes and events available in NRQL, see our [Attribute Dictionary](https://docs.newrelic.com/attribute-dictionary/).
