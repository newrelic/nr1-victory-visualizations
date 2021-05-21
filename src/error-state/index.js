import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, HeadingText } from 'nr1';

const ErrorState = ({ children }) => (
  <Card className="ErrorState">
    <CardBody className="ErrorState-cardBody">
      <HeadingText
        className="ErrorState-headingText"
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        {children ?? 'Oops! Something went wrong.'}
      </HeadingText>
    </CardBody>
  </Card>
);

ErrorState.propTypes = {
  children: PropTypes.node,
};

export default ErrorState;
