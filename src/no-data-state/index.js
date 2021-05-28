import React from 'react';
import { Card, CardBody, HeadingText, BlockText } from 'nr1';

const NoDataState = () => (
  <Card className="NoDataState">
    <CardBody className="NoDataState-cardBody">
      <div className="NoDataState-cardBody-background">
        <HeadingText
          className="NoDataState-headingText"
          type={HeadingText.TYPE.HEADING_3}
        >
          No chart data available
        </HeadingText>
        <BlockText
          className="NoDataState-bodyText"
          type={BlockText.TYPE.NORMAL}
        >
          Try a different query or increase the time range by adding a{' '}
          <code>SINCE</code> clause to the end of your query.
        </BlockText>
      </div>
    </CardBody>
  </Card>
);

export default NoDataState;
