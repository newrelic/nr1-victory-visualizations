import React from 'react';
import { VictoryTooltip } from 'victory';

const TOOLTIP_PADDING = 16;

/*
** TO DO **
  1. replace with CSS vars for `flyoutStyle`: 
  {
    stroke: datum?.color ? 'var(--nr1--base-colors--ui--gray--2)', 
    strokeWidth: 2, 
    fill: 'var(--nr1--base-colors--ui--gray--2)',
    filter: 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.32))'
  }

  and for `style`:
  [
    {
      color: 'var(--nr1--typography--heading--6--color)',
      fontSize: 'var(--nr1--typography--heading--6--font-size)',
      fontWeight: 'var(--nr1--typography--heading--6--font-weight)',
      fontFamily: 'var(--nr1--typography--heading--6--font-family)',
      lineHeight:  'var(--nr1--typography--heading--6--line-height)',
    },
    {
      color: 'var(--nr1--colors--text--secondary)',
      fontSize: 'var(--nr1--typography--body--1--font-size)',
      fontFamily: 'var(--nr1--typography--heading--6--font-family)',
      baselineShift: 'sub',
    },
  ]
*/

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
            color: '#223030',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: `Open Sans,"Segoe UI","Tahoma",sans-serif`,
            lineHeight: '16px'
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
