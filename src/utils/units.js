import numeral from 'numeral';
import { format } from 'date-fns';

export const TYPES_TO_UNITS = {
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

const formatDecimals = (t) => {
  if (t >= 1000) {
    return numeral(t).format('0a');
  } else if (t < 0.01) {
    return numeral(t).format('0.000');
  } else if (t < 1) {
    return numeral(t).format('0.0');
  }
  return t;
};

export const formatTicks = ({ unit, t }) => {
  if (unit === 'TIMESTAMP') {
    return format(new Date(t), 'MM/dd/yyyy HH:mm');
  }
  return `${formatDecimals(t)}${TYPES_TO_UNITS[unit]}`;
};
