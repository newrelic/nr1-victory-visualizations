import React from 'react';
import { Grid, GridItem } from 'nr1';

const LegendItem = ({ color, label }) => {
  return (
    <GridItem columnSpan={3}>
      <div className="LegendItem">
        <div
          className="LegendItem-dot"
          style={{ backgroundColor: color }}
        ></div>
        <div className="LegendItem-label">{label}</div>
      </div>
    </GridItem>
  );
};

const Legend = ({ items, style, className }) => {
  return (
    <div className={className} style={style}>
      <Grid spacingType={Grid.SPACING_TYPE.NONE} gapType={Grid.GAP_TYPE.SMALL}>
        {items.map((item) => (
          <LegendItem {...item} />
        ))}
      </Grid>
    </div>
  );
};

export default Legend;
