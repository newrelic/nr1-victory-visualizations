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

const BASE_FORMAT = '0a.0';

const getFormatString = (tickIncrement) => {
  if (!tickIncrement || tickIncrement >= 1) {
    return BASE_FORMAT;
  }

  const splitByDecimal = tickIncrement.toString().split('.');

  if (splitByDecimal.length === 1) {
    return BASE_FORMAT;
  }

  const charArray = splitByDecimal[1].split('');

  let index = 0;
  while (charArray[index] === '0') {
    index++;
  }
  return BASE_FORMAT + '0'.repeat(index);
};

const formatDecimals = ({ tick, tickIncrement }) => {
  return numeral(tick).format(getFormatString(tickIncrement));
};

export const typeToUnit = (unitType) => TYPES_TO_UNITS[unitType];

export const formatTicks = ({ unitType, tick, tickIncrement }) => {
  if (unitType === 'TIMESTAMP') {
    return format(new Date(tick), 'MM/dd/yyyy HH:mm');
  }
  return `${formatDecimals({ tick, tickIncrement })}${typeToUnit(unitType)}`;
};
