import numeral from 'numeral';
import { format } from 'date-fns';

const TYPES_TO_UNITS = {
  APDEX: '',
  BITS: 'b',
  BITS_PER_MS: 'b/ms',
  BITS_PER_S: 'b/s',
  BYTES: 'B',
  BYTES_PER_MS: 'B/ms',
  BYTES_PER_S: 'B/s',
  COUNT: '',
  HERTZ: 'Hz',
  MS: 'ms',
  PAGES_PER_SECOND: 'page/s',
  PERCENTAGE: '%',
  REQUESTS_PER_SECOND: 'req/s',
  SECONDS: 's',
  TIMESTAMP: '',
  UNKNOWN: '',
};

const formatDecimals = (tick) => {
  if (tick >= 1000) {
    return numeral(tick).format('0a');
  } else if (tick < 0.01) {
    return numeral(t).format('0.000');
  } else if (tick < 1) {
    return numeral(t).format('0.0');
  }
  return tick;
};

export const typeToUnit = (unitType) => TYPES_TO_UNITS[unitType];

export const formatTicks = ({ unitType, tick }) => {
  if (unitType === 'TIMESTAMP') {
    return format(new Date(tick), 'MM/dd/yyyy HH:mm');
  }
  return `${formatDecimals(tick)}${typeToUnit(unitType)}`;
};
