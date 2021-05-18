import React from 'react';
import { VictoryTooltip } from 'victory';

/*  
TODO: 
1. add units 
2. center pointer to stack
*/

const TOOLTIP_PADDING = 8;

class Tooltip extends React.Component {
  static defaultEvents = VictoryTooltip.defaultEvents;
  render() {
    const {datum, scale} = this.props; 
    const diff = Math.abs(datum._y1 - datum._y0) / 2 + datum._y0
    const scaledY = scale.y(diff) + TOOLTIP_PADDING
    return (
      <VictoryTooltip
        {...this.props}
        constrainToVisibleArea
        horizontal
        flyoutStyle={{
          strokeWidth: 0,
          fill: `#f7f8f8`,
          filter: `drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.32))`,
        }}
        y={scaledY}
        flyoutPadding={TOOLTIP_PADDING}
        style={[
          {
            color: '#3e4c4c',
            fontSize: '14px',
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
