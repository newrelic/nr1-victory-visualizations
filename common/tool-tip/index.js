import React from 'react';
import { VictoryTooltip } from 'victory';

const TOOLTIP_PADDING = 16;

class Tooltip extends React.Component {
  static defaultEvents = VictoryTooltip.defaultEvents;
  render() {
    // `defaultProps` are the props that are supplied by assigning the Tooltip to the `labelComponent`
    const { isStackedBarChart, ...defaultProps } = this.props;
    const { scale, datum } = defaultProps;

    // this sets the position of the tooltip to the middle of the bar for a stacked bar chart
    const scaledY = isStackedBarChart
      ? scale.y(Math.abs(datum._y1 - datum._y0) / 2 + datum._y0) +
      TOOLTIP_PADDING/2
      : datum.y;

    return (
      <VictoryTooltip
        {...defaultProps}
        constrainToVisibleArea
        horizontal
        flyoutStyle={{
          strokeWidth: 2,
          stroke: datum?.color ?? `#f7f8f8`,
          fill: `#f7f8f8`,
          filter: `drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.32))`,
        }}
        y={scaledY}
        flyoutPadding={TOOLTIP_PADDING}
        style={[
          {
            color: '#3e4c4c',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: `Open Sans,"Segoe UI","Tahoma",sans-serif`,
          },
          {
            color: '#223030',
            fontSize: '12px',
            fontFamily: `Open Sans,"Segoe UI","Tahoma",sans-serif`,
            baselineShift: 'sub',
          },
        ]}
      />
    );
  }
}

export default Tooltip;
