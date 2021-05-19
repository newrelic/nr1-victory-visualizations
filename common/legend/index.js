import React from 'react';
import { Grid, GridItem } from 'nr1';
import cx from 'classnames';

const LegendItem = ({ color, label }) => {
  return (
    <GridItem columnSpan={3} className="LegendItem">
      <div className="LegendItem-content">
        <div
          className="LegendItem-dot"
          style={{ backgroundColor: color }}
        ></div>
        <div className="LegendItem-label">{label}</div>
      </div>
    </GridItem>
  );
};

const Legend = ({ items, height, style, className }) => {
  return (
    <Grid
      className={cx('Legend', className)}
      style={{ ...style, height }}
      gapType={Grid.GAP_TYPE.SMALL}
    >
      {items.map((item) => (
        <LegendItem {...item} />
      ))}
    </Grid>
  );
};

export default Legend;
