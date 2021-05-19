import React from 'react';
import { VictoryTooltip } from 'victory';

const TOOLTIP_PADDING = 16;

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

    return (
      <VictoryTooltip
        {...defaultProps}
        constrainToVisibleArea
        flyoutStyle={{
          stroke: datum?.color ?? 'var(--nr1--colors--background--surface)', 
          strokeWidth: 2, 
          fill: 'var(--nr1--colors--background--surface)',
          filter: 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.32))'
        }}
        y={scaledY}
        flyoutPadding={TOOLTIP_PADDING}
        style={[
          {
            color: 'var(--nr1--typography--heading--6--color)',
            fontSize: '12px',
            fontFamily: 'var(--nr1--typography--heading--6--font-family)',
            fontWeight: 'var(--nr1--typography--heading--6--font-weight)'
          },
          {
            color: 'var(--nr1--colors--text--secondary)',
            fontSize: '12px',
            fontFamily: 'var(--nr1--typography--body--1--font-family)',
            baselineShift: 'sub',
          },
        ]}
      />
    );
  }
}

export default Tooltip;
