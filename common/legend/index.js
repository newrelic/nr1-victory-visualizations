import React from 'react';
import { VictoryLegend, Point } from 'victory';

const Legend = ({ ...props }) => {
  return (
    <VictoryLegend
      dataComponent={<Point size={5} />}
      gutter={20}
      orientation="horizontal"
      symbolSpacer={5}
      {...props}
    />
  );
};

export default Legend;
