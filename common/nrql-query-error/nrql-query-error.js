import React from 'react';
import PropTypes from 'prop-types';

const NrqlQueryError = ({ title, description }) => (
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
