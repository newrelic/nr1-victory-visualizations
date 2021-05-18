import React from 'react';
import { VictoryLegend } from 'victory';

const Legend = ({ data, onClick, ...rest }) => {
  console.log({ data });
  return <VictoryLegend data={data} onclick={onClick} {...rest} />;
};

export default Legend;
