import React from 'react';
import { Grid, GridItem } from 'nr1';
import cx from 'classnames';

const Legend = ({ items, style, className }) => {
  return (
    <div className={cx('Legend', className)} style={{ ...style }}>
      <Grid gapType={Grid.GAP_TYPE.SMALL}>
        {items.map((item) => (
          <LegendItem {...item} />
        ))}
      </Grid>
    </div>
  );
};

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

export default Legend;
