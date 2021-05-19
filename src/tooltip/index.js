import React from 'react';
import { VictoryTooltip } from 'victory';

const TOOLTIP_PADDING = 16;

/*
** TO DO **
  1. replace with CSS vars for `flyoutStyle`: 
  {
    stroke: datum?.color ? 'var(--nr1--colors--background--surface)', 
    strokeWidth: 2, 
    fill: 'var(--nr1--colors--background--surface)',
    filter: 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.32))'
  }

  and for `style`:
  [
    {
      color: 'var(--nr1--typography--heading--5--color)',
      fontSize: 'var(--nr1--typography--heading--5--font-size)',
      fontFamily: 'var(--nr1--typography--heading--5--font-family)',
    },
    {
      color: 'var(--nr1--colors--text--secondary)',
      fontSize: 'var(--nr1--typography--body--1--font-size)',
      fontFamily: 'var(--nr1--typography--body--1--font-family)',
      baselineShift: 'sub',
    },
  ]
*/

class Tooltip extends React.Component {
  static defaultEvents = VictoryTooltip.defaultEvents;

  render() {
    // `defaultProps` are the props that are supplied by assigning the Tooltip to the `labelComponent`
    const { setY, ...defaultProps } = this.props;
    const { scale, datum } = defaultProps;

    // this sets the y position of the tooltip 
    const scaledY = setY 
      ? scale.y(setY(datum)) + TOOLTIP_PADDING/2
      : datum.y

    console.log(defaultProps)

    return (
      <VictoryTooltip
        {...defaultProps}
        constrainToVisibleArea
        flyoutStyle={{
          strokeWidth: 2,
          stroke: datum?.color ?? `#fff`,
          fill: `#fff`,
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
