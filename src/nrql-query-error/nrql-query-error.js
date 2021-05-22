import React from 'react';
import PropTypes from 'prop-types';

const NrqlQueryError = ({
  title,
  description = 'Something went wrong with the provided NRQL query',
}) => (
  <div className="NrqlQueryError">
    <div className="NrqlQueryError-title">{title}</div>
    <div className="NrqlQueryError-description">{description}</div>
  </div>
);

NrqlQueryError.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
    .isRequired,
};

export default NrqlQueryError;
