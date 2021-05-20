import React from 'react';
import { VictoryTooltip } from 'victory';
import colors from '../colors';
import theme from '../theme';

class Tooltip extends React.Component {
  static defaultEvents = VictoryTooltip.defaultEvents;

  render() {
    // `defaultProps` are the props that are supplied by assigning the Tooltip to the `labelComponent`
    const { setY, ...defaultProps } = this.props;
    const { scale, datum } = defaultProps;

    // this sets the y position of the tooltip 
    const scaledY = setY 
      ? scale.y(setY(datum)) 
      : datum.y

    return (
      <VictoryTooltip
        {...defaultProps}
        constrainToVisibleArea
        style={theme.tooltip.style}
        flyoutStyle={{
          ...theme.tooltip.flyoutStyle,
          stroke: datum.color ?? colors.background.surface, 
          strokeWidth: 1,
        }}
        flyoutPadding={theme.tooltip.flyoutPadding}
        y={scaledY} 
      />
    );
  }
}

export default Tooltip;
